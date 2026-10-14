import './app/styles/global.css';
import { Engine } from './app/index.js';

const engine = new Engine(document.getElementById('app'));
if (import.meta.hot) import.meta.hot.dispose(() => engine.dispose());
