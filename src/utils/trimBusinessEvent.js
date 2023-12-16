import { DOT } from '../constants';

const trimBusinessEvent = (event) => (event ? event.split(DOT).slice(1).join(DOT) : null);

export default trimBusinessEvent;
