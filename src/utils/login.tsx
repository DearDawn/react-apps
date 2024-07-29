import { LoginModal } from '@/components/login';
import { showModal } from 'sweet-me';

export const showLoginBox = () => {
  return showModal(({ onClose }) => <LoginModal onClose={onClose} />, {
    maskClosable: false,
  });
};
