import Avatar1 from '@/assets/images/Avatars/1.svg';
import Avatar2 from '@/assets/images/Avatars/2.svg';
import Avatar3 from '@/assets/images/Avatars/3.svg';
import Avatar4 from '@/assets/images/Avatars/4.svg';
import Avatar5 from '@/assets/images/Avatars/5.svg';
import Avatar6 from '@/assets/images/Avatars/6.svg';
import Avatar7 from '@/assets/images/Avatars/7.svg';
import Avatar8 from '@/assets/images/Avatars/8.svg';
import Avatar9 from '@/assets/images/Avatars/9.svg';
import Avatar10 from '@/assets/images/Avatars/10.svg';
import Avatar11 from '@/assets/images/Avatars/11.svg';
import Avatar12 from '@/assets/images/Avatars/12.svg';
import Avatar13 from '@/assets/images/Avatars/13.svg';
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

// Define the type for our avatars object
export type AvatarType = FC<SvgProps>;
export type AvatarsType = { [key: number]: AvatarType };

// Export default avatar separately
export const DefaultAvatar = Avatar13;

// Export selectable avatars
export const avatars: AvatarsType = {
    1: Avatar1,
    2: Avatar2,
    3: Avatar3,
    4: Avatar4,
    5: Avatar5,
    6: Avatar6,
    7: Avatar7,
    8: Avatar8,
    9: Avatar9,
    10: Avatar10,
    11: Avatar11,
    12: Avatar12,
};