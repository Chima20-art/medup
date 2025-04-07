import { ImageSourcePropType } from 'react-native';

// Define the type for our avatars object
export type AvatarType = ImageSourcePropType;
export type AvatarsType = { [key: number]: AvatarType };

// Export default avatar separately (avatar 13)
export const DefaultAvatar = require('../assets/images/Avatars/13.png');

// Export selectable avatars
export const avatars: AvatarsType = {
    1: require('../assets/images/Avatars/1.png'),
    2: require('../assets/images/Avatars/2.png'),
    3: require('../assets/images/Avatars/3.png'),
    4: require('../assets/images/Avatars/4.png'),
    5: require('../assets/images/Avatars/5.png'),
    6: require('../assets/images/Avatars/6.png'),
    7: require('../assets/images/Avatars/7.png'),
    8: require('../assets/images/Avatars/8.png'),
    9: require('../assets/images/Avatars/9.png'),
    10: require('../assets/images/Avatars/10.png'),
    11: require('../assets/images/Avatars/11.png'),
    12: require('../assets/images/Avatars/12.png'),
};