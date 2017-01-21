import xs from 'xstream';
import { div } from '@cycle/dom';
import onionify from 'cycle-onionify';
import css from 'stylin';
import tinycolor from 'tinycolor2';

import { between } from '../helpers';
import { hueStyle } from '../styles/hue';
import intent from '../generators/intent';

function view ([props, hue, dimensions]) {
  const hueIndicatorStyle = {
    left: `${dimensions.width * hue}px`
  };

  return (
    div(`.hue-container ${css.unimportant(hueStyle)}`, [
      div('.hue', [
        div('.hue-indicator', {style: hueIndicatorStyle})
      ])
    ])
  );
}

function calculateHue (event, dimensions) {
  return function _calcuateHue () {
    const containerWidth = dimensions.width;
    const left = event.pageX - (dimensions.left + window.scrollX);

    const hue = between(0, containerWidth, left) / containerWidth;

    return hue;
  };
}

function setHueFromProps (props) {
  return tinycolor.fromRatio(props).toHsv().h / 360;
}

function Hue ({DOM, onion, color$}) {
  const hue$ = onion.state$;

  const { dimensions$, changeEvents$ } = intent({DOM, selector: '.hue-container'});

  const calculatedHue$ = dimensions$
    .map(dimensions => changeEvents$.map(event => calculateHue(event, dimensions)))
    .flatten();

  const reducer$ = xs.merge(
    // initialState$,
    calculatedHue$
  );

  return {
    DOM: xs.combine(color$, hue$, dimensions$).map(view),
    change$: calculatedHue$.map(hue => ({h: hue})),
    onion: reducer$
  };
}

export default onionify(Hue);
