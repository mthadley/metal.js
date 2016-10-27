'use strict';

import { EventEmitter } from 'metal-events';

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */
class ComponentRenderer extends EventEmitter {
	/**
	 * Constructor function for `ComponentRenderer`.
	 * @param {!Component} component The component that this renderer is
	 *     responsible for.
	 */
	constructor(component) {
		super();
		this.component_ = component;

		if (this.component_.constructor.SYNC_UPDATES_MERGED) {
			this.component_.on(
				'stateKeyChanged',
				this.handleRendererStateKeyChanged_.bind(this)
			);
		} else {
			this.component_.on(
				'stateChanged',
				this.handleRendererStateChanged_.bind(this)
			);
		}
	}

	/**
	 * Returns this renderer's component.
	 * @return {!Component}
	 */
	getComponent() {
		return this.component_;
	}

	/**
	 * Returns extra configuration for data that should be added to the manager.
	 * @return {Object}
	 */
	getExtraDataConfig() {
		return null;
	}

	/**
	 * Handles the "rendered" event.
	 * @protected
	 */
	handleRendered_() {
		var firstRender = !this.isRendered_;
		this.isRendered_ = true;
		this.emit('rendered', firstRender);
	}

	/**
	 * Handles a `dataChanged` event from the component's data manager. Calls the
	 * `update` function if the component has already been rendered for the first
	 * time.
	 * @param {!Object<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 * @protected
	 */
	handleRendererStateChanged_(changes) {
		if (this.shouldRerender_()) {
			this.update(changes);
		}
	}

	/**
	 * Handles a `dataPropChanged` event from the component's data manager. This
	 * is similar to `handleRendererStateChanged_`, but only called for
	 * components that have requested updates to happen synchronously.
	 * @param {!{key: string, newVal: *, prevVal: *}} data
	 * @protected
	 */
	handleRendererStateKeyChanged_(data) {
		if (this.shouldRerender_()) {
			this.update({
				changes: {
					[data.key]: data
				}
			});
		}
	}

	/**
	 * Renders the component's whole content (including its main element).
	 */
	render() {
		if (!this.component_.element) {
			this.component_.element = document.createElement('div');
		}
		this.handleRendered_();
	}

	/**
	 * Checks if changes should cause a rerender right now.
	 * @return {boolean}
	 * @protected
	 */
	shouldRerender_() {
		return this.isRendered_ && !this.skipUpdates_;
	}

	/**
	 * Skips updates until `stopSkipUpdates` is called.
	 */
	startSkipUpdates() {
		this.skipUpdates_ = true;
	}

	/**
	 * Stops skipping updates.
	 */
	stopSkipUpdates() {
		this.skipUpdates_ = false;
	}

	/**
	 * Updates the component's element html. This is automatically called when
	 * the value of at least one of the component's state keys has changed.
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 */
	update() {}
}

export default ComponentRenderer;
