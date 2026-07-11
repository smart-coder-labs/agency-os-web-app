import '@/lib/__mocks__/prisma';
import { prismaMock } from '@/lib/__mocks__/prisma';

const mockRedirect = jest.fn();
const mockRevalidatePath = jest.fn();
const mockUser = { id: 'user-uuid-1', email: 'test@test.com', full_name: 'Test User' };

jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
  notFound: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

jest.mock('@/lib/auth', () => ({
  currentUser: jest.fn().mockResolvedValue(mockUser),
}));

// Mock the DAL so we control what createProjectInDb does
jest.mock('@/lib/dal/projects.dal', () => ({
  createProjectInDb: jest.fn(),
  updateProjectInDb: jest.fn(),
  deleteProjectInDb: jest.fn(),
  getProjectById: jest.fn(),
}));

import { createProject } from './project-actions';
import { createProjectInDb } from '@/lib/dal/projects.dal';

describe('createProject server action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns validation errors when name is missing', async () => {
    const formData = new FormData();
    formData.set('description', 'A description that is long enough');

    const result = await createProject({ errors: undefined, message: null }, formData);

    expect(result.errors).toBeDefined();
    expect(result.errors?.name).toBeDefined();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('returns validation errors when description is too short', async () => {
    const formData = new FormData();
    formData.set('name', 'Valid Name');
    formData.set('description', 'Too short');

    const result = await createProject({ errors: undefined, message: null }, formData);

    expect(result.errors).toBeDefined();
    expect(result.errors?.description).toBeDefined();
  });

  it('returns not authenticated message when user is null', async () => {
    const { currentUser } = require('@/lib/auth');
    (currentUser as jest.Mock).mockResolvedValueOnce(null);

    const formData = new FormData();
    formData.set('name', 'My Project');
    formData.set('description', 'A description that is long enough');

    const result = await createProject({ errors: undefined, message: null }, formData);

    expect(result.message).toBe('Not authenticated.');
  });

  it('calls createProjectInDb and redirects on valid input', async () => {
    (createProjectInDb as jest.Mock).mockResolvedValue({ id: 'new-uuid', name: 'My Project' });

    const formData = new FormData();
    formData.set('name', 'My Project');
    formData.set('description', 'A description that is long enough to pass validation');

    await createProject({ errors: undefined, message: null }, formData);

    expect(createProjectInDb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'My Project' })
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith('/projects');
    expect(mockRedirect).toHaveBeenCalledWith('/projects');
  });

  it('returns error message when createProjectInDb throws', async () => {
    (createProjectInDb as jest.Mock).mockRejectedValue(new Error('DB error'));

    const formData = new FormData();
    formData.set('name', 'My Project');
    formData.set('description', 'A description that is long enough to pass validation');

    const result = await createProject({ errors: undefined, message: null }, formData);

    expect(result.message).toMatch(/base de datos/i);
  });
});
