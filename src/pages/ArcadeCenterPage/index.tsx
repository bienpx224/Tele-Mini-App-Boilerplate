
import { FC } from 'react';
import { BasePage } from '../../layouts/index';
import PartBoxGame from './PartBoxGame';
import '../../styles/pages/ArcadeCenterPage.scss';

const ArcadeCenterPage: FC = () => {
  return (
    <BasePage className="arcade-page">
      <div className="arcade-page__content">
         <PartBoxGame />
         {/* <TonSpace /> */}
      </div>
    </BasePage>
  );
};

export default ArcadeCenterPage;
