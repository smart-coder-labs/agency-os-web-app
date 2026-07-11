import '../__mocks__/prisma';
import { prismaMock } from '../__mocks__/prisma';

const mockUser = { id: 'user-uuid-1', email: 'test@test.com', full_name: 'Test User' };

jest.mock('@/lib/auth', () => ({
  currentUser: jest.fn().mockResolvedValue(mockUser),
}));

import { getProjectById, getProjectsCount } from './projects.dal';

describe('projects.dal', () => {
  describe('getProjectById', () => {
    it('returns the project when found and user matches', async () => {
      const mockProject = {
        id: 'uuid-1',
        name: 'Test Project',
        status: 'DISCOVERY',
        user_id: 'user-uuid-1',
      } as any;
      prismaMock.projects.findUnique.mockResolvedValue(mockProject);

      const result = await getProjectById('uuid-1');

      expect(result).toEqual(mockProject);
      expect(prismaMock.projects.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid-1' } })
      );
    });

    it('returns null when project belongs to a different user', async () => {
      const mockProject = {
        id: 'uuid-1',
        name: 'Other Project',
        status: 'DISCOVERY',
        user_id: 'different-user-uuid',
      } as any;
      prismaMock.projects.findUnique.mockResolvedValue(mockProject);

      const result = await getProjectById('uuid-1');

      expect(result).toBeNull();
    });

    it('returns project with null user_id (admin-created) regardless of current user', async () => {
      const mockProject = {
        id: 'uuid-admin',
        name: 'Admin Project',
        status: 'DISCOVERY',
        user_id: null,
      } as any;
      prismaMock.projects.findUnique.mockResolvedValue(mockProject);

      const result = await getProjectById('uuid-admin');

      expect(result).toEqual(mockProject);
    });

    it('returns null when project does not exist', async () => {
      prismaMock.projects.findUnique.mockResolvedValue(null);

      const result = await getProjectById('uuid-missing');

      expect(result).toBeNull();
    });
  });

  describe('getProjectsCount', () => {
    it('returns count for the current user', async () => {
      prismaMock.projects.count.mockResolvedValue(5);

      const result = await getProjectsCount();

      expect(result).toBe(5);
      expect(prismaMock.projects.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 'user-uuid-1' } })
      );
    });

    it('returns 0 when user is not authenticated', async () => {
      const { currentUser } = require('@/lib/auth');
      (currentUser as jest.Mock).mockResolvedValueOnce(null);

      const result = await getProjectsCount();

      expect(result).toBe(0);
    });
  });
});
