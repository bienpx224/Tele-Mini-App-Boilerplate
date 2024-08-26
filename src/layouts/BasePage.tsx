import React, { ReactNode, FC } from 'react';
import '../styles/layouts/BasePage.scss';
import { Header, Footer } from './index';

import config from '../config';

interface IBasePage {
  children?: ReactNode;
  className?: string;
}

const BasePage: FC<IBasePage> = ({ children, className }) => {
  const linkSocial = config.link;

  return (
    <>
      
      <div className={`main-content ${className}`}>
        <div>{children}</div>

        <div className="list-socials">
          {/* <a href={linkSocial.twitter} target="_blank" title={'Twitter'}>
            <div className="btn-social">
              <IconTwitter />
            </div>
          </a>
          <a href={linkSocial.telegram} target="_blank" title={'Telegram'}>
            <div className="btn-social">
              <IconTelegram />
            </div>
          </a> */}
          {/*<a href={linkSocial.discord} target="_blank" title={'Discord'}>*/}
          {/*  <div className="btn-social">*/}
          {/*    <IconDiscord />*/}
          {/*  </div>*/}
          {/*</a>*/}
        </div>
      </div>
    </>
  );
};

export default BasePage;
