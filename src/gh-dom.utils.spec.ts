import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  createProfile,
  createName,
  createAvatar,
  createFollowButton,
  createFollowers,
  createFollowContainer,
} from './gh-dom.utils';

describe('DOM Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createProfile', () => {
    it('should create a profile div with children', () => {
      const child1 = document.createElement('div');
      child1.textContent = 'Child 1';
      const child2 = document.createElement('span');
      child2.textContent = 'Child 2';

      const profile = createProfile([child1, child2]);

      expect(profile.tagName).toBe('DIV');
      expect(profile.classList.contains('profile')).toBe(true);
      expect(profile.children).toHaveLength(2);
      expect(profile.children[0]).toBe(child1);
      expect(profile.children[1]).toBe(child2);
    });

    it('should create a profile div with no children', () => {
      const profile = createProfile([]);

      expect(profile.tagName).toBe('DIV');
      expect(profile.classList.contains('profile')).toBe(true);
      expect(profile.children).toHaveLength(0);
    });
  });

  describe('createName', () => {
    it('should create a name link with valid inputs', () => {
      const profileUrl = 'https://github.com/testuser';
      const name = 'Test User';

      const nameElement = createName(profileUrl, name);

      expect(nameElement.tagName).toBe('A');
      expect(nameElement.href).toBe(profileUrl);
      expect(nameElement.className).toBe('name');
      expect(nameElement.textContent).toBe(name);
    });

    it('should handle empty name gracefully', () => {
      const profileUrl = 'https://github.com/testuser';
      const name = '';

      const nameElement = createName(profileUrl, name);

      expect(nameElement.textContent).toBe('');
    });

    it('should handle null name gracefully', () => {
      const profileUrl = 'https://github.com/testuser';
      const name = null as any;

      const nameElement = createName(profileUrl, name);

      expect(nameElement.textContent).toBe('');
    });

    it('should handle undefined name gracefully', () => {
      const profileUrl = 'https://github.com/testuser';
      const name = undefined as any;

      const nameElement = createName(profileUrl, name);

      expect(nameElement.textContent).toBe('');
    });
  });

  describe('createAvatar', () => {
    it('should create an avatar image with correct attributes', () => {
      const avatarUrl = 'https://avatars.githubusercontent.com/u/123456';

      const avatar = createAvatar(avatarUrl);

      expect(avatar.tagName).toBe('IMG');
      expect(avatar.src).toBe(avatarUrl);
      expect(avatar.className).toBe('avatar');
      expect(avatar.alt).toBe('GitHub avatar');
    });

    it('should handle empty avatar URL', () => {
      const avatarUrl = '';

      const avatar = createAvatar(avatarUrl);

      expect(avatar.tagName).toBe('IMG');
      expect(avatar.src).toBe('https://piotrl.github.io/github-profile-card');
      expect(avatar.className).toBe('avatar');
      expect(avatar.alt).toBe('GitHub avatar');
    });
  });

  describe('createFollowButton', () => {
    it('should create a follow button with correct attributes', () => {
      const username = 'testuser';
      const followUrl = 'https://github.com/testuser';

      const button = createFollowButton(username, followUrl);

      expect(button.tagName).toBe('A');
      expect(button.href).toBe(followUrl);
      expect(button.className).toBe('follow-button');
      expect(button.textContent).toBe('Follow @testuser');
    });

    it('should handle empty username', () => {
      const username = '';
      const followUrl = 'https://github.com/testuser';

      const button = createFollowButton(username, followUrl);

      expect(button.textContent).toBe('Follow @');
    });

    it('should handle special characters in username', () => {
      const username = 'test-user_123';
      const followUrl = 'https://github.com/test-user_123';

      const button = createFollowButton(username, followUrl);

      expect(button.textContent).toBe('Follow @test-user_123');
    });
  });

  describe('createFollowers', () => {
    it('should create a followers span with count', () => {
      const followersAmount = 1234;

      const followers = createFollowers(followersAmount);

      expect(followers.tagName).toBe('SPAN');
      expect(followers.className).toBe('followers');
      expect(followers.textContent).toBe('1234');
    });

    it('should handle zero followers', () => {
      const followersAmount = 0;

      const followers = createFollowers(followersAmount);

      expect(followers.textContent).toBe('0');
    });

    it('should handle large follower counts', () => {
      const followersAmount = 999999;

      const followers = createFollowers(followersAmount);

      expect(followers.textContent).toBe('999999');
    });

    it('should handle negative numbers', () => {
      const followersAmount = -5;

      const followers = createFollowers(followersAmount);

      expect(followers.textContent).toBe('-5');
    });
  });

  describe('createFollowContainer', () => {
    it('should create a follow container with children', () => {
      const followButton = createFollowButton(
        'testuser',
        'https://github.com/testuser',
      );
      const followers = createFollowers(100);

      const container = createFollowContainer([followButton, followers]);

      expect(container.tagName).toBe('DIV');
      expect(container.className).toBe('followMe');
      expect(container.children).toHaveLength(2);
      expect(container.children[0]).toBe(followButton);
      expect(container.children[1]).toBe(followers);
    });

    it('should create an empty follow container', () => {
      const container = createFollowContainer([]);

      expect(container.tagName).toBe('DIV');
      expect(container.className).toBe('followMe');
      expect(container.children).toHaveLength(0);
    });

    it('should handle mixed child elements', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      const anchor = document.createElement('a');

      const container = createFollowContainer([div, span, anchor]);

      expect(container.children).toHaveLength(3);
      expect(container.children[0]).toBe(div);
      expect(container.children[1]).toBe(span);
      expect(container.children[2]).toBe(anchor);
    });
  });

  describe('integration tests', () => {
    it('should create a complete profile structure', () => {
      const avatar = createAvatar(
        'https://avatars.githubusercontent.com/u/123456',
      );
      const name = createName('https://github.com/testuser', 'Test User');
      const followButton = createFollowButton(
        'testuser',
        'https://github.com/testuser',
      );
      const followers = createFollowers(1234);
      const followContainer = createFollowContainer([followButton, followers]);
      const profile = createProfile([avatar, name, followContainer]);

      expect(profile.classList.contains('profile')).toBe(true);
      expect(profile.children).toHaveLength(3);

      // Check avatar
      const avatarElement = profile.children[0] as HTMLImageElement;
      expect(avatarElement.tagName).toBe('IMG');
      expect(avatarElement.className).toBe('avatar');

      // Check name
      const nameElement = profile.children[1] as HTMLAnchorElement;
      expect(nameElement.tagName).toBe('A');
      expect(nameElement.className).toBe('name');
      expect(nameElement.textContent).toBe('Test User');

      // Check follow container
      const followContainerElement = profile.children[2] as HTMLDivElement;
      expect(followContainerElement.tagName).toBe('DIV');
      expect(followContainerElement.className).toBe('followMe');
      expect(followContainerElement.children).toHaveLength(2);
    });

    it('should handle XSS attempts in user data', () => {
      const maliciousName = '<script>alert("xss")</script>';
      const maliciousUsername = '<img src=x onerror=alert("xss")>';

      const nameElement = createName(
        'https://github.com/testuser',
        maliciousName,
      );
      const followButton = createFollowButton(
        maliciousUsername,
        'https://github.com/testuser',
      );

      // Text content should be escaped
      expect(nameElement.textContent).toBe(maliciousName);
      expect(nameElement.innerHTML).not.toContain('<script>');

      expect(followButton.textContent).toBe(`Follow @${maliciousUsername}`);
      expect(followButton.innerHTML).not.toContain('<img');
    });
  });
});
