import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import FaqAccordionTmpl from '/src/app/components/page-items/templates/faq-accordion.tmpl.html';
import FaqTmpl from '/src/app/components/page-items/templates/faq.tmpl.html';
import TableTmpl from '/src/app/components/page-items/templates/table.tmpl.html';

// Two page items that are a template and the data it is given, with no code of
// their own: a FAQ whose rows open, and a table. What is held here is what each
// template draws from its data, and that the browser's own elements come through
// the app's sanitizer as they were written.

// A template is drawn through the app's sanitizer, which the app sets up as it
// starts.
before(() => {
  SpyneApp.init({ debug: false });
});

const draw = (template, data) => {
  const el = document.createElement('div');

  el.appendChild(new DomElementTemplate(template, data).renderDocFrag());

  return el;
};

const wordsOf = (el, selector) =>
  [...el.querySelectorAll(selector)].map((node) => node.textContent.trim());

describe('a FAQ that opens', () => {
  const data = {
    title: 'Before you book',
    items: [
      { q: 'Can I bring a dog?', a: 'Yes, on a lead.' },
      { q: 'Is there parking?', a: 'Behind the hall, free.' },
    ],
  };

  it('should draw a row for each question, as a details element', () => {
    const rows = draw(FaqAccordionTmpl, data).querySelectorAll(
      '.accordion > details',
    );

    expect(rows).to.have.lengthOf(2);
  });

  it("should put the question in the row's summary and the answer under it", () => {
    const el = draw(FaqAccordionTmpl, data);

    expect(wordsOf(el, 'details > summary')).to.deep.eq([
      'Can I bring a dog?',
      'Is there parking?',
    ]);
    expect(wordsOf(el, 'details > .accordion__panel')).to.deep.eq([
      'Yes, on a lead.',
      'Behind the hall, free.',
    ]);
  });

  it('should draw every row closed', () => {
    const rows = [...draw(FaqAccordionTmpl, data).querySelectorAll('details')];

    expect(rows.map((row) => row.hasAttribute('open'))).to.deep.eq([
      false,
      false,
    ]);
  });

  it('should take the same data the plain FAQ takes', () => {
    const plain = draw(FaqTmpl, data);
    const opening = draw(FaqAccordionTmpl, data);

    expect(wordsOf(opening, 'summary')).to.deep.eq(wordsOf(plain, '.faq-q'));
    expect(wordsOf(opening, '.accordion__panel')).to.deep.eq(
      wordsOf(plain, '.faq-a'),
    );
    expect(wordsOf(opening, '.faq-title')).to.deep.eq(['Before you book']);
  });

  it('should draw no row for a FAQ with no questions', () => {
    const el = draw(FaqAccordionTmpl, { title: 'Soon', items: [] });

    expect(el.querySelectorAll('details')).to.have.lengthOf(0);
    expect(el.querySelectorAll('.accordion')).to.have.lengthOf(1);
  });
});

describe('a table', () => {
  const data = {
    title: 'Sizes and prices',
    attrLabel: 'Sizes and prices',
    head: ['Size', 'Serves', 'Price'],
    rows: [
      { cells: ['Small', '2 to 4', '$18'] },
      { cells: ['Large', '10 to 12', '$46'] },
    ],
    note: 'Prices include delivery.',
  };

  it('should draw a table, in something that can be scrolled and has a name', () => {
    const el = draw(TableTmpl, data);
    const holder = el.querySelector('.table-scroll');

    expect(holder.querySelectorAll('table.table')).to.have.lengthOf(1);
    expect(holder.getAttribute('tabindex')).to.eq('0');
    expect(holder.getAttribute('role')).to.eq('region');
    expect(holder.getAttribute('aria-label')).to.eq('Sizes and prices');
  });

  it('should draw a header cell for each column, each naming its column', () => {
    const heads = [...draw(TableTmpl, data).querySelectorAll('thead th')];

    expect(heads.map((head) => head.textContent)).to.deep.eq([
      'Size',
      'Serves',
      'Price',
    ]);
    heads.forEach((head) => {
      expect(head.getAttribute('scope')).to.eq('col');
    });
  });

  it('should draw a row for each entry and a cell for each of its words, in the table', () => {
    const rows = [...draw(TableTmpl, data).querySelectorAll('tbody tr')];

    expect(rows).to.have.lengthOf(2);
    expect(
      rows.map((row) => [...row.children].map((cell) => cell.textContent)),
    ).to.deep.eq([
      ['Small', '2 to 4', '$18'],
      ['Large', '10 to 12', '$46'],
    ]);
    rows.forEach((row) => {
      expect([...row.children].every((cell) => cell.tagName === 'TD')).to.eq(
        true,
      );
    });
  });

  it('should leave nothing of the loops outside the table', () => {
    const el = draw(TableTmpl, data);
    const loose = el.textContent.replace(/\s+/g, ' ');

    expect(loose).to.not.include('{{');
    expect(el.querySelectorAll('td, th')).to.have.lengthOf(9);
    expect(el.querySelectorAll('.table td, .table th')).to.have.lengthOf(9);
  });

  it('should draw its title and the note under it', () => {
    const el = draw(TableTmpl, data);

    expect(wordsOf(el, '.table-title')).to.deep.eq(['Sizes and prices']);
    expect(wordsOf(el, '.table-note')).to.deep.eq(['Prices include delivery.']);
  });

  it('should draw a table with no rows as a header alone', () => {
    const el = draw(TableTmpl, { ...data, rows: [] });

    expect(el.querySelectorAll('thead th')).to.have.lengthOf(3);
    expect(el.querySelectorAll('tbody tr')).to.have.lengthOf(0);
  });
});
