/* eslint-disable @typescript-eslint/no-explicit-any */
import prod from './prod.json';
import dev from './dev.json';

const env = import.meta.env.VITE_APP_ENV || 'dev';
const configs: any = { prod, dev };
const config: Config = configs[env];
export interface Config {
  link: {
    twitter: string;
    telegram: string;
    discord: string;
    dextools: string;
  };
  game_build_version: string;
  address_bank: string;
  ton_api: string;
  ton_manifestUrl : string;
}

export default config;
