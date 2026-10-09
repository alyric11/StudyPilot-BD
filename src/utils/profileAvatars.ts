const backgrounds = ['eae5ff', 'dff3ed', 'ffe8d9', 'e1efff', 'ffe3ec', 'fff1ce'];

// Public, non-personal seeds keep avatar choices stable without sharing student details.
export function profileAvatar(index: number) {
  return `https://api.dicebear.com/10.x/adventurer/svg?seed=studypilot-avatar-${index}&backgroundColor=${backgrounds[index % backgrounds.length]}`;
}

export const profileAvatarChoices = Array.from({ length: 60 }, (_, index) => profileAvatar(index));
