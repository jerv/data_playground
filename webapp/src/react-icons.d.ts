declare module 'react-icons/fi' {
  import { IconType } from 'react-icons';
  
  export const FiArrowLeft: IconType;
  export const FiEdit: IconType;
  export const FiTrash2: IconType;
  export const FiPlus: IconType;
  export const FiDatabase: IconType;
  export const FiSave: IconType;
  export const FiX: IconType;
  export const FiUser: IconType;
  export const FiLock: IconType;
  export const FiLogIn: IconType;
  export const FiHome: IconType;
  export const FiMail: IconType;
  export const FiKey: IconType;
  export const FiUserPlus: IconType;
  export const FiChevronDown: IconType;
  export const FiMoreVertical: IconType;
  export const FiGrid: IconType;
  export const FiList: IconType;
}

declare module 'react-icons' {
  import { ComponentType, SVGAttributes } from 'react';
  
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
} 