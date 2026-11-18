import { expect } from 'chai';
import {
  materialButtonClass,
  materialButtonLook,
  materialButtonOptions,
} from '/src/app/traits/utils/material-button-options.js';
import { PageItemCoreTraits } from '/src/app/traits/page/page-item-core-traits.js';

const giveLook = (data) => PageItemCoreTraits.pageItemCore$GiveButtonLook(data);

describe('materialButtonOptions', () => {
  it('should give the defaults for keys left out', () => {
    expect(materialButtonOptions({})).to.deep.eq({
      variant: 'filled',
      size: 'sm',
      shape: 'round',
      disabled: false,
    });
  });

  it('should give the default for a value a key does not take', () => {
    expect(
      materialButtonOptions({ variant: 'ghost', size: 'huge' }),
    ).to.include({ variant: 'filled', size: 'sm' });
  });
});

describe('materialButtonClass', () => {
  it('should write the variant and the size after btn', () => {
    expect(materialButtonClass({ variant: 'tonal', size: 'md' })).to.eq(
      'btn btn-tonal btn-md',
    );
  });

  it('should add the square shape, and nothing for the round one', () => {
    expect(materialButtonClass({ shape: 'square' })).to.eq(
      'btn btn-filled btn-sm btn-square',
    );
    expect(materialButtonClass({ shape: 'round' })).to.eq(
      'btn btn-filled btn-sm',
    );
  });
});

describe('materialButtonLook', () => {
  it('should be the Shell’s own class when the model has no button key', () => {
    expect(materialButtonLook(undefined)).to.eq('btn-primary');
    expect(materialButtonLook(null)).to.eq('btn-primary');
  });

  it('should be the classes the key asks for, without btn itself', () => {
    expect(
      materialButtonLook({ variant: 'outlined', size: 'lg', shape: 'square' }),
    ).to.eq('btn-outlined btn-lg btn-square');
  });

  it('should fill in what an empty key leaves out', () => {
    expect(materialButtonLook({})).to.eq('btn-filled btn-sm');
  });
});

describe('pageItemCore$GiveButtonLook', () => {
  it('should give data with no button key the Shell’s own class', () => {
    const shaped = giveLook({ ctaText: 'Explore', attrCtaHref: '/docs' });

    expect(shaped.attrButtonClass).to.eq('btn-primary');
  });

  it('should give data with a button key that key’s classes', () => {
    const shaped = giveLook({
      ctaText: 'Order ahead',
      button: { variant: 'tonal', size: 'md' },
    });

    expect(shaped.attrButtonClass).to.eq('btn-tonal btn-md');
  });

  it('should give each item of a list its own, where the item has ctaText', () => {
    const shaped = giveLook({
      rows: [
        { headline: 'One', ctaText: 'More', button: { variant: 'text' } },
        { headline: 'Two', ctaText: 'More' },
        { headline: 'Three' },
      ],
    });

    expect(shaped.rows[0].attrButtonClass).to.eq('btn-text btn-sm');
    expect(shaped.rows[1].attrButtonClass).to.eq('btn-primary');
    expect(shaped.rows[2]).to.not.have.property('attrButtonClass');
  });

  it('should leave the authored keys as they are', () => {
    const shaped = giveLook({
      ctaText: 'Order ahead',
      button: { variant: 'tonal' },
      tags: ['a', 'b'],
    });

    expect(shaped.ctaText).to.eq('Order ahead');
    expect(shaped.button).to.deep.eq({ variant: 'tonal' });
    expect(shaped.tags).to.deep.eq(['a', 'b']);
  });

  it('should give a call to action with no words the class that keeps its button from being drawn', () => {
    expect(giveLook({ ctaText: '', attrCtaHref: '' }).attrButtonClass).to.eq(
      'btn-primary btn-no-words',
    );
    expect(giveLook({ ctaText: '   ' }).attrButtonClass).to.eq(
      'btn-primary btn-no-words',
    );
    expect(giveLook({ ctaText: null }).attrButtonClass).to.eq(
      'btn-primary btn-no-words',
    );
    expect(
      giveLook({ ctaText: '', button: { variant: 'tonal', size: 'md' } })
        .attrButtonClass,
    ).to.eq('btn-tonal btn-md btn-no-words');
  });

  it('should leave a button that has words, or whose words are not in ctaText, to be drawn', () => {
    expect(giveLook({ ctaText: 'Order ahead' }).attrButtonClass).to.eq(
      'btn-primary',
    );
    // the contact form: its button's words are in its template
    expect(giveLook({ formFields: [] }).attrButtonClass).to.eq('btn-primary');
  });

  it('should decide it for each row of a list on its own', () => {
    const shaped = giveLook({
      rows: [
        { headline: 'One', ctaText: 'More', ctaHref: '/one' },
        { headline: 'Two', ctaText: '' },
        { headline: 'Three' },
      ],
    });

    expect(shaped.rows[0].attrButtonClass).to.eq('btn-primary');
    expect(shaped.rows[1].attrButtonClass).to.eq('btn-primary btn-no-words');
    expect(shaped.rows[2]).to.not.have.property('attrButtonClass');
  });

  it('should not change the data it was given', () => {
    const given = { ctaText: 'Explore', rows: [{ ctaText: 'More' }] };

    giveLook(given);

    expect(given).to.deep.eq({
      ctaText: 'Explore',
      rows: [{ ctaText: 'More' }],
    });
  });

  it('should give the same result when shaped twice', () => {
    const once = giveLook({ ctaText: 'Explore', button: { size: 'lg' } });

    expect(giveLook(once)).to.deep.eq(once);
  });

  it('should pass on what is not an object', () => {
    expect(giveLook(undefined)).to.eq(undefined);
    expect(giveLook(null)).to.eq(null);
  });
});
