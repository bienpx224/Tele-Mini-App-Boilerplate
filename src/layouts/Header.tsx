import React, { FC, useEffect, useState } from 'react';
import {
  IconTelegram,
  IconTwitter,
} from '../assets/icons';
import { Link, useLocation } from 'react-router-dom';
import config from '../config';

const Header: FC = () => {
  const [sticky, setSticky] = useState('');
  const location = useLocation();
  const link = config.link;

  useEffect(() => {
    window.addEventListener('scroll', isSticky);

    return () => {
      window.removeEventListener('scroll', isSticky);
    };
  }, []);

  const isSticky = () => {
    const scrollTop = window.scrollY;
    const stickyClass = scrollTop >= 1 ? 'fixed' : '';
    setSticky(stickyClass);
  };


  return (
    <div
      className={`header ${sticky} ${
        location.pathname === '/arcade-center' ? 'fixed' : ''
      }`}
    >
      <div className="header__content">
        <div className="header__menu--left">
          <div className="header__logo">
            <img src={'/images/logo.gif'} />
          </div>
          <div className="header__menu">
            <a href={'https://www.pacman.meme/'} target="_blank">
              <div className="header__menu-item">Home</div>
            </a>
          </div>
        </div>

        <div className="header__menu--right">

          <a href={link.twitter} target="_blank" title={'Twitter'}>
            <div className="header__menu-social">
              <IconTwitter />
            </div>
          </a>
          <a href={link.telegram} target="_blank" title={'Telegram'}>
            <div className="header__menu-social">
              <IconTelegram />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
