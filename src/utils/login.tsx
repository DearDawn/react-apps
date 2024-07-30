import { LoginModal } from '@/components/login';
import { showModal } from 'sweet-me';

export const showLoginBox = (autoStart = false) => {
  return showModal(
    ({ onClose }) => <LoginModal onClose={onClose} autoStart={autoStart} />,
    {
      maskClosable: false,
    }
  );
};
