import {POINT_TYPES} from '../const';
import {getTypeOffers, humanizeDate} from '../utils';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createDestinationList(destinations) {
  return (`<datalist id="destination-list-1">
                ${destinations.map((destination) => `<option value="${destination.name}"></option>`).join('')}
            </datalist>`);
}


function createPhotosList(photos) {
  return photos.length === 0 ? '' : (`        <div class="event__photos-container">
                      <div class="event__photos-tape">
                      ${photos.map((photo) => `<img class="event__photo" src="${photo.src}" alt="${photo.description}">`).join('')}
                      </div>
                    </div>`);
}

function createEventTypesList(currentType) {
  return (`<div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${currentType}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>

                        ${POINT_TYPES.map((type) =>
      `<div class="event__type-item">
                          <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${type === currentType ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type[0].toUpperCase() + type.slice(1)}</label>
                        </div>`).join('')}
                      </fieldset>
                    </div>
                  </div>`);
}

function createOffersList(offers, typeOffers) {
  return typeOffers.map((offer) =>
    `<div class="event__offer-selector">
                        <input class="event__offer-checkbox  visually-hidden" id="${offer.id}" type="checkbox" name="${offer.id}" ${offers.includes(offer.id) ? 'checked' : ''}>
                        <label class="event__offer-label" for="${offer.id}">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>`).join('');
}

function createEditRoutePointTemplate(routePoint, offersByType, destinations) {
  const {basePrice, dateFrom, dateTo, offers, type} = routePoint;
  const currentDestination = destinations.find((destination) => destination.id === routePoint.destination);

  return (
    `<li class="trip-events__item">
              <form class="event event--edit" action="#" method="post">
                <header class="event__header">
                   ${createEventTypesList(type)}

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${type}
                    </label>
                    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination.name}" list="destination-list-1">
                    ${createDestinationList(destinations)}
                 </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizeDate(dateFrom, 'DD/MM/YY HH:mm')}">
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizeDate(dateTo, 'DD/MM/YY HH:mm')}">
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                  <button class="event__reset-btn" type="reset">Delete</button>
                  <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>
                </header>
                ${offersByType.length === 0 ? '' : `
                <section class="event__details">
                    <section class="event__section  event__section--offers">
                      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                      <div class="event__available-offers">
                      ${createOffersList(offers, getTypeOffers(routePoint.type, offersByType))}
                      </div>
                    </section>`}

                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${currentDestination.description}</p>
                    ${createPhotosList(currentDestination.pictures)}
                  </section>
                </section>
              </form>
            </li>`
  );
}

export default class EditRoutePointView extends AbstractStatefulView {
  #routePoint = null;
  #offersByType = null;
  #destinations = null;

  #handleSubmitClick = null;
  #handleRollUpClick = null;

  #datepickerFrom = null;
  #datepickerTo = null;

  static parsePointToState = ({ routePoint }) => ({ routePoint });
  static parseStateToPoint = (state) => state.routePoint;


  get template() {
    return createEditRoutePointTemplate(this._state.routePoint, this.#offersByType, this.#destinations);
  }

  constructor({routePoint, offersByType, destinations, onSubmitClick, onRollUpClick}) {
    super();
    this.#routePoint = routePoint;
    this.#offersByType = offersByType;
    this.#destinations = destinations;

    this.#handleSubmitClick = onSubmitClick;
    this.#handleRollUpClick = onRollUpClick;

    this._setState(EditRoutePointView.parsePointToState({ routePoint }));
    this._restoreHandlers();
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitClickHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollUpClickHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#offerChangeHandler);

    this.#setDatepicker();
  }

  #submitClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmitClick(EditRoutePointView.parseStateToPoint(this._state));
  };

  #rollUpClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollUpClick();
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      routePoint: {
        ...this._state.routePoint,
        basePrice: evt.target.value,
      }
    });
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      routePoint: {
        ...this._state.routePoint,
        type: evt.target.value
      },
    });
  };

  #destinationChangeHandler = (evt) => {
    const destinationId = this.#destinations.find((destination) => destination.name === evt.target.value).id;
    this.updateElement({
      routePoint: {
        ...this._state.routePoint,
        destination: destinationId,
      }
    });
  };

  #offerChangeHandler = (event) => {
    const id = event.target.id;
    const offers = this._state.routePoint.offers;
    const index = offers.indexOf(id);

    if (index !== -1) {
      offers.splice(index, 1);
    } else {
      offers.push(id);
    }

    this._setState({
      routePoint: {
        ...this._state.routePoint,
        offers: offers
      }
    });
  };

  reset(routePoint) {
    this.updateElement({
      routePoint
    });
  }

  #setDatepicker = () => {
    const [dateFromElement, dateToElement] = this.element.querySelectorAll('.event__input--time');
    const config = {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      locale: {
        firstDayOfWeek: 1,
      },
      'time_24hr': true
    };

    if (this._state.routePoint.dateFrom) {
      this.#datepickerFrom = flatpickr(
        dateFromElement,
        {
          ...config,
          defaultDate: this._state.dateFrom,
          maxDate: this._state.dateTo,
          onClose: this.#routePointDateFromCloseHandler,
        },
      );
    }

    if (this._state.routePoint.dateTo) {
      this.#datepickerTo = flatpickr(
        dateToElement,
        {
          ...config,
          defaultDate: this._state.dateTo,
          minDate: this._state.dateFrom,
          onClose: this.#routePointDateToCloseHandler,
        },
      );
    }
  };


  #routePointDateFromCloseHandler = ([userDate]) => {
    this._setState({
      routePoint:{
        ...this._state.routePoint,
        dateFrom: userDate
      }
    });
    this.#datepickerTo.set('minDate', this._state.routePoint.dateFrom);
  };

  #routePointDateToCloseHandler = ([userDate]) => {
    this._setState({
      routePoint:{
        ...this._state.routePoint,
        dateTo: userDate
      }
    });
    this.#datepickerFrom.set('maxDate', this._state.routePoint.dateFrom);
  };


  removeElement = () => {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  };
}
