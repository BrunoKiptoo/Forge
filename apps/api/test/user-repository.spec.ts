import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { UserRepository } from "../src/core/database/repositories/user.repository";

describe("UserRepository", () => {
  let repository: UserRepository;

  const mockModel = {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    find: jest.fn().mockReturnValue({ exec: jest.fn() }),
    create: jest.fn(),
    findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
    countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
    select: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken("User"),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should find user by lowercase email", async () => {
      const mockExec = jest.fn().mockResolvedValue({ email: "test@example.com" });
      mockModel.findOne.mockReturnValue({ exec: mockExec });

      const result = await repository.findByEmail("Test@Example.com");
      expect(mockModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com" }),
      );
      expect(result).toEqual({ email: "test@example.com" });
    });
  });

  describe("findByGithubId", () => {
    it("should find user by github ID", async () => {
      const mockExec = jest.fn().mockResolvedValue({ githubId: "123" });
      mockModel.findOne.mockReturnValue({ exec: mockExec });

      await repository.findByGithubId("123");
      expect(mockModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ githubId: "123", deletedAt: null }),
      );
    });
  });

  describe("findByEmailWithPassword", () => {
    it("should select passwordHash field", async () => {
      mockModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({ exec: jest.fn() }),
      });
      const selectSpy = jest.fn().mockReturnValue({ exec: jest.fn() });
      mockModel.findOne.mockReturnValue({ select: selectSpy });

      await repository.findByEmailWithPassword("test@example.com");
      expect(selectSpy).toHaveBeenCalledWith("+passwordHash");
    });
  });
});
