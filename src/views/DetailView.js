import { MultiscaleImageLayer, ImageLayer, ScaleBarLayer } from '../layers';
import VivView from './VivView';
import { getVivId } from './utils';
import { OVERVIEW_VIEW_ID } from './OverviewView';

export const DETAIL_VIEW_ID = 'detail';

/**
 * This class generates a MultiscaleImageLayer and a view for use in the VivViewer as a detailed view.
 * It takes the same arguments for its constructor as its base class VivView.
 * */
export default class DetailView extends VivView {
  getLayers({ props, viewStates }) {
    const {
      loader,
      loaderSelection,
      newLoaderSelection,
      onViewportLoad,
      transitionFields
    } = props;
    const { id, height, width } = this;
    const layerViewState = viewStates[id];
    const layers = [];

    // Create at least one layer even without loaderSelection so that the tests pass.
    if (loader.isPyramid) {
      layers.push(
        ...[loaderSelection, newLoaderSelection]
          .filter((s, i) => i === 0 || s)
          .map((s, i) => {
            const suffix = s
              ? `-${transitionFields.map(f => s[0][f]).join('-')}`
              : '';
            const newProps =
              i !== 0
                ? {
                    onViewportLoad,
                    refinementStrategy: 'never',
                    excludeBackground: true
                  }
                : {};
            return new MultiscaleImageLayer({
              ...props,
              ...newProps,
              loaderSelection: s,
              id: `${loader.type}${getVivId(id)}${suffix}`,
              viewportId: id
            });
          })
      );
    } else {
      layers.push(
        new ImageLayer(props, {
          id: `${loader.type}${getVivId(id)}`,
          viewportId: id
        })
      );
    }

    const { physicalSizes } = loader;
    if (physicalSizes) {
      const { x } = physicalSizes;
      const { unit, value } = x;
      if (unit && value) {
        layers.push(
          new ScaleBarLayer({
            id: getVivId(id),
            loader,
            unit,
            size: value,
            viewState: { ...layerViewState, height, width }
          })
        );
      }
    }

    return layers;
  }

  /**
   * Create a viewState for this class, checking the id to make sure this class and viewState match.
   * @param {Object} args
   * @param {ViewState} args.ViewState ViewState object.
   * @returns {ViewState} ViewState for this class (or null by default if the ids do not match).
   */
  filterViewState({ viewState, currentViewState }) {
    if (viewState.id === OVERVIEW_VIEW_ID) {
      const { target } = viewState;
      if (target) {
        return { ...currentViewState, target };
      }
    }
    return super.filterViewState({ viewState });
  }
}
