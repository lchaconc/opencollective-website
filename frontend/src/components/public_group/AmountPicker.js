import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import formatCurrency from '../../lib/format_currency';
import convertToCents from '../../lib/convert_to_cents';
import DonationPicker from '../DonationPicker';
import AsyncButton from '../AsyncButton';

export default class AmountPicker extends React.Component {
  render() {
    const {
      group,
      donationForm,
      onToken,
      appendDonationForm,
      tier,
      inProgress
    } = this.props;

    donationForm[tier.name] = donationForm[tier.name] || {};
    const stripeKey = group.stripeAccount && group.stripeAccount.stripePublishableKey;
    const amount = donationForm[tier.name].amount !== undefined ? donationForm[tier.name].amount : tier.range[0];
    const frequency = donationForm[tier.name].frequency || tier.interval;
    const currency = donationForm[tier.name].currency || group.currency;
    const hasPaypal = group.hasPaypal;
    const hasStripe = stripeKey && amount !== '';
    const frequencyHuman = frequency === 'one-time' ? '' : `per ${frequency.replace(/ly$/,'')}`;
    const stripeDescription =  `${formatCurrency(amount, currency, { compact: false })} ${frequencyHuman}`;
    const button = tier.button || `Donate ${stripeDescription}`;
    const cancellationDisclaimer = (frequency !== 'one-time') ? "You can cancel anytime." : "";

    return (
      <div>
        {tier.presets && (
          <DonationPicker
            value={amount}
            currency={currency}
            frequency={frequency}
            presets={tier.presets}
            onChange={({amount, frequency, currency}) => appendDonationForm(tier.name, {amount, frequency, currency})}
            // MAJOR HACK to support a donation for this group.
            showCurrencyPicker={group.id == 10}/>
        )}

        <div className='max-width-1 mx-auto' style={{marginBottom: '-80px'}}>
          {hasPaypal && (
            <AsyncButton
              color='green'
              inProgress={inProgress}
              customClass='btn -btn-big -bg-green -ttu -ff-sec -fw-bold'
              onClick={() => onToken({
                amount,
                frequency,
                currency,
                options: {
                  paypal: true
                }
              })}>
              {button}
            </AsyncButton>
          )}

          {hasStripe && !hasPaypal && ( // paypal has priority -> to refactor after prototyping phase
            <StripeCheckout
              token={(token) => onToken({amount, frequency, currency, token})}
              stripeKey={stripeKey}
              name={group.name}
              currency={currency}
              amount={convertToCents(amount)}
              description={stripeDescription}>
                <AsyncButton
                  color='green'
                  inProgress={inProgress}
                  customClass='btn -btn-big -bg-green -ttu -ff-sec -fw-bold'>
                  {button}
                </AsyncButton>
            </StripeCheckout>
          )}

          <div className='PublicGroupForm-disclaimer h6 mt2' style={{minHeight: 38}}>
            By clicking above, you are pledging to give {group.host.name} {stripeDescription} for {group.name}. {cancellationDisclaimer}
          </div>
        </div>
      </div>
    );
  }
}
