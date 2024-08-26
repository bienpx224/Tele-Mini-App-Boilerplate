import React, { FC } from 'react';
import { IconPacmanHeader, IconTelegram, IconTwitter } from '../assets/icons';
import config from '../config';

interface IFooter {
  className?: string;
}

const Footer: FC<IFooter> = ({ className }) => {
  const linkSocial = config.link;

  return (
    <div className={`footer ${className}`}>
      
    </div>
  );
};

export default Footer;
