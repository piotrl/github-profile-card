function appendChildren($parent: HTMLElement, nodes: HTMLElement[]): void {
  nodes.forEach((node) => $parent.appendChild(node));
}

export function createProfile(children: HTMLElement[]): HTMLDivElement {
  const $profile = document.createElement('div');
  $profile.classList.add('profile');
  appendChildren($profile, children);

  return $profile;
}

export function createName(profileUrl: string, name: string): HTMLAnchorElement {
  const $name = document.createElement('a');
  $name.href = profileUrl;
  $name.className = 'name';
  $name.appendChild(document.createTextNode(name || ''));

  return $name;
}

export function createAvatar(avatarUrl: string): HTMLImageElement {
  const $avatar = document.createElement('img');
  $avatar.src = avatarUrl;
  $avatar.className = 'avatar';
  $avatar.alt = 'GitHub avatar';

  return $avatar;
}

export function createFollowButton(
  username: string,
  followUrl: string,
): HTMLAnchorElement {
  const $followButton = document.createElement('a');
  $followButton.href = followUrl;
  $followButton.className = 'follow-button';
  $followButton.textContent = `Follow @${username}`;

  return $followButton;
}

export function createFollowers(followersAmount: number): HTMLSpanElement {
  const $followers = document.createElement('span');
  $followers.className = 'followers';
  $followers.textContent = String(followersAmount);

  return $followers;
}

export function createFollowContainer(children: HTMLElement[]): HTMLDivElement {
  const $followContainer = document.createElement('div');
  $followContainer.className = 'followMe';
  appendChildren($followContainer, children);

  return $followContainer;
}
