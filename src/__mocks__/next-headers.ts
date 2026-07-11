const cookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn(),
};

export const cookies = jest.fn(() => Promise.resolve(cookieStore));
export const headers = jest.fn(() => Promise.resolve(new Headers()));
