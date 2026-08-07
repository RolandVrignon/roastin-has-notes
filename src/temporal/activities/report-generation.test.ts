import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrismaMock } = vi.hoisted(() => ({ getPrismaMock: vi.fn() }));

vi.mock("@/lib/db", () => ({ getPrisma: getPrismaMock }));

import { markReportFailed } from "./report-generation";

describe("failed report cleanup", () => {
  beforeEach(() => getPrismaMock.mockReset());

  it("deletes partial generation artifacts in the same transaction that marks the report failed", async () => {
    const deleteMany = vi.fn(() => Promise.resolve({ count: 1 }));
    const updateMany = vi.fn(() => Promise.resolve({ count: 1 }));
    const transaction = vi.fn((operations: Promise<unknown>[]) => Promise.all(operations));
    getPrismaMock.mockReturnValue({
      generationArtifact: { deleteMany },
      report: { updateMany },
      $transaction: transaction,
    });

    await markReportFailed("report-123", "GENERATION_FAILED");

    expect(deleteMany).toHaveBeenCalledWith({ where: { reportId: "report-123" } });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "report-123", status: "GENERATING", deletedAt: null },
      data: { status: "FAILED", generationStage: "FAILED", publicErrorCode: "GENERATION_FAILED" },
    });
    expect(transaction).toHaveBeenCalledOnce();
  });
});
