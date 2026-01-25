import { describe, it, expect, vi } from "vitest";
import { Response } from "express";
import { sendResponse, sendError } from "@/utils/response";
import { mock } from "vitest-mock-extended";

describe("Response Utils", () => {
  /**
   * Verifies that successful responses are formatted correctly.
   * Expects status 200, status 'success', matched message, and data payload.
   */
  it("sendResponse should send a success response", () => {
    const res = mock<Response>();
    res.status.mockReturnThis();
    res.json.mockReturnThis();

    sendResponse(res, 200, "Success", { id: 1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Success",
      data: { id: 1 },
    });
  });

  /**
   * Verifies that 4xx status codes are treated as errors.
   * Expects status 'error' and data to be undefined.
   */
  it("sendResponse should determine error status for 4xx codes", () => {
    const res = mock<Response>();
    res.status.mockReturnThis();
    res.json.mockReturnThis();

    sendResponse(res, 400, "Bad Request");

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Bad Request",
      data: undefined,
    });
  });

  /**
   * Verifies that explicit error responses are formatted correctly.
   * Expects status 'error', matched message, and error details.
   */
  it("sendError should send an error response", () => {
    const res = mock<Response>();
    res.status.mockReturnThis();
    res.json.mockReturnThis();

    sendError(res, 500, "Internal Error", "Details");

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal Error",
      error: "Details",
    });
  });
});
