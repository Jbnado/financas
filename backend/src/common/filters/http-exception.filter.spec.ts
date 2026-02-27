import {
  HttpException,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;

  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
  const mockHttpArgumentsHost = jest.fn().mockReturnValue({
    getResponse: mockGetResponse,
    getRequest: jest.fn(),
  });
  const mockArgumentsHost = {
    switchToHttp: mockHttpArgumentsHost,
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  it("should return { statusCode, message, error } for HttpException", () => {
    const exception = new BadRequestException("Validation failed");

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Validation failed",
      }),
    );
  });

  it("should return 500 Internal Server Error for non-HTTP exceptions", () => {
    const exception = new Error("Something broke");

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  });

  it("should handle HttpException with object response", () => {
    const exception = new HttpException(
      { statusCode: 403, message: "Forbidden", error: "Forbidden" },
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 403,
      message: "Forbidden",
      error: "Forbidden",
    });
  });
});
