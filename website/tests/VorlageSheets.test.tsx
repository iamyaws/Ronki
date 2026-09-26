import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  VorlagePrint,
  VORLAGE_PRINT_ABEND,
  VORLAGE_PRINT_ADHS,
  VORLAGE_PRINT_KLEINE_GESCHWISTER,
  VORLAGE_PRINT_MORGEN,
  type VorlagePrintTemplate,
} from '../src/pages/print/VorlagePrint';
import { TaskPicture } from '../src/components/sheet';
import VorlageMorgen from '../src/pages/VorlageMorgen';
import VorlageAbend from '../src/pages/VorlageAbend';

const FOOTER_LINE = 'Ronki hilft beim Dranbleiben. Streaks gibt es hier nicht.';

function renderPrint(template: VorlagePrintTemplate) {
  return render(
    <MemoryRouter>
      <VorlagePrint template={template} />
    </MemoryRouter>,
  );
}

function sheetSteps() {
  return within(screen.getByRole('list', { name: 'Die Schritte' })).getAllByRole('listitem');
}

function taskPictures(root: ParentNode) {
  return Array.from(root.querySelectorAll('img')).filter((img) =>
    img.getAttribute('src')?.startsWith('/art/bilderbuch/tasks/'),
  );
}

describe('Print sheets in the Bilderbuch look', () => {
  it('renders a drawn picture and the label for a step with img', () => {
    const { container } = renderPrint(VORLAGE_PRINT_MORGEN);
    const picture = container.querySelector('img[src="/art/bilderbuch/tasks/toothbrush.webp"]');
    expect(picture).not.toBeNull();
    // Decorative: the label next to it carries the meaning.
    expect(picture).toHaveAttribute('alt', '');
    expect(screen.getByText('Zähne putzen')).toBeInTheDocument();
  });

  it('keeps the steps and wording and gives every step a picture', () => {
    expect(VORLAGE_PRINT_MORGEN.steps.map((s) => [s.label, s.img])).toEqual([
      ['Zähne putzen', 'toothbrush.webp'],
      ['Anziehen', 'shirt.webp'],
      ['Frühstücken', 'plate.webp'],
      ['Tasche packen', 'bag.webp'],
    ]);
    expect(VORLAGE_PRINT_ABEND.steps.map((s) => [s.label, s.img])).toEqual([
      ['Zähne putzen', 'toothbrush.webp'],
      ['Gesicht waschen', 'wash.webp'],
      ['Pyjama an', 'pajama.webp'],
      ['Schlafenszeit', 'nightlight.webp'],
    ]);
    expect(VORLAGE_PRINT_KLEINE_GESCHWISTER.steps.map((s) => s.img)).toEqual([
      'toothbrush.webp',
      'shirt.webp',
      'plate.webp',
      'teddy.webp',
    ]);
    expect(VORLAGE_PRINT_ADHS.steps.map((s) => [s.label, s.img])).toEqual([
      ['Aufwachen', 'wake.webp'],
      ['Klo', 'toilet.webp'],
      ['Anziehen', 'shirt.webp'],
      ['Frühstück', 'plate.webp'],
      ['Zähne', 'toothbrush.webp'],
      ['Ranzen', 'bag.webp'],
    ]);
  });

  it('falls back to the emoji when a step has no picture', () => {
    const { container } = render(<TaskPicture icon="🧸" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('🧸');
  });

  it('shows the toddler sheet with pictures only, no words', () => {
    renderPrint(VORLAGE_PRINT_KLEINE_GESCHWISTER);
    const rows = sheetSteps();
    expect(rows).toHaveLength(4);
    rows.forEach((row, i) => {
      // Only the step number, no label, no hint, no clock line.
      expect(row.textContent?.trim()).toBe(String(i + 1));
      expect(taskPictures(row)).toHaveLength(1);
    });
  });

  it('keeps the clip lane, the clip note and the time bar on the ADHS sheet', () => {
    const { container } = renderPrint(VORLAGE_PRINT_ADHS);
    expect(sheetSteps()).toHaveLength(6);
    expect(container.querySelectorAll('[data-clip-lane]')).toHaveLength(6);
    expect(screen.getByText(VORLAGE_PRINT_ADHS.nowMarker!)).toBeInTheDocument();
    expect(screen.getByText(VORLAGE_PRINT_ADHS.timeBar!.start)).toBeInTheDocument();
    expect(screen.getByText(VORLAGE_PRINT_ADHS.timeBar!.end)).toBeInTheDocument();
    expect(screen.getByText(VORLAGE_PRINT_ADHS.timeBar!.note!)).toBeInTheDocument();
  });

  it('lets Ronki host each sheet with the right bubble', () => {
    const cases: Array<[VorlagePrintTemplate, string | null]> = [
      [VORLAGE_PRINT_MORGEN, 'Was ist als Nächstes dran?'],
      [VORLAGE_PRINT_ABEND, 'Gleich wird es gemütlich.'],
      [VORLAGE_PRINT_ADHS, 'Ein Schritt nach dem anderen.'],
      [VORLAGE_PRINT_KLEINE_GESCHWISTER, null],
    ];
    for (const [template, bubble] of cases) {
      const { container, unmount } = renderPrint(template);
      expect(container.querySelector('img[src^="/art/bilderbuch/ronki/"]')).not.toBeNull();
      const bubbles = container.querySelectorAll('[data-ronki-bubble]');
      if (bubble) {
        expect(bubbles).toHaveLength(1);
        expect(bubbles[0]).toHaveTextContent(bubble);
      } else {
        expect(bubbles).toHaveLength(0);
      }
      unmount();
    }
  });

  it('ends the morning, evening and toddler sheet with the done band (Astra rep 5)', () => {
    for (const template of [VORLAGE_PRINT_MORGEN, VORLAGE_PRINT_ABEND, VORLAGE_PRINT_KLEINE_GESCHWISTER]) {
      const { unmount } = renderPrint(template);
      expect(screen.getByText('Geschafft!')).toBeInTheDocument();
      // The band points at no circle of its own, so it only says the morning is done.
      expect(screen.getByText('Für heute fertig. Ronki jubelt mit.')).toBeInTheDocument();
      expect(screen.queryByText(/Male den letzten Kreis aus/)).toBeNull();
      unmount();
    }
  });

  it('prints the footer line on every sheet', () => {
    for (const template of [
      VORLAGE_PRINT_MORGEN,
      VORLAGE_PRINT_ABEND,
      VORLAGE_PRINT_KLEINE_GESCHWISTER,
      VORLAGE_PRINT_ADHS,
    ]) {
      const { unmount } = renderPrint(template);
      expect(screen.getByText(FOOTER_LINE)).toBeInTheDocument();
      expect(screen.getByText('ronki.de/vorlagen')).toBeInTheDocument();
      unmount();
    }
  });
});

describe('On-screen sheet on the template pages', () => {
  function renderMorgen() {
    return render(
      <MemoryRouter>
        <VorlageMorgen />
      </MemoryRouter>,
    );
  }

  it('uses the drawn pictures and the same footer as the PDF', () => {
    renderMorgen();
    const pictures = taskPictures(screen.getByRole('list', { name: 'Die Schritte' }));
    expect(pictures.map((img) => img.getAttribute('src'))).toEqual([
      '/art/bilderbuch/tasks/toothbrush.webp',
      '/art/bilderbuch/tasks/shirt.webp',
      '/art/bilderbuch/tasks/plate.webp',
      '/art/bilderbuch/tasks/bag.webp',
    ]);
    expect(screen.getByText(FOOTER_LINE)).toBeInTheDocument();
    expect(screen.getByText('Was ist als Nächstes dran?')).toBeInTheDocument();
  });

  it('adds Aufstehen and Waschen in front when the switch is on', () => {
    renderMorgen();
    expect(sheetSteps()).toHaveLength(4);
    expect(screen.getByText(/^Vier Schritte bis zur Tasche\./)).toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: 'Aufstehen und Waschen dazunehmen' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();

    // The line under the sheet title counts the steps, so it follows the switch.
    expect(screen.queryByText(/^Vier Schritte bis zur Tasche\./)).toBeNull();
    expect(screen.getByText(/^Sechs Schritte bis zur Tasche\./)).toBeInTheDocument();

    const rows = sheetSteps();
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveTextContent('Aufstehen');
    expect(rows[0]).toHaveTextContent('Licht an, Vorhang auf.');
    expect(taskPictures(rows[0])[0]).toHaveAttribute('src', '/art/bilderbuch/tasks/wake.webp');
    expect(rows[1]).toHaveTextContent('Waschen');
    expect(rows[1]).toHaveTextContent('Gesicht und Hände.');
    expect(taskPictures(rows[1])[0]).toHaveAttribute('src', '/art/bilderbuch/tasks/wash.webp');
    expect(rows[2]).toHaveTextContent('Zähne putzen');
    expect(rows[5]).toHaveTextContent('Tasche packen');

    fireEvent.click(toggle);
    expect(sheetSteps()).toHaveLength(4);
  });

  it('offers the switch on the morning page only', () => {
    render(
      <MemoryRouter>
        <VorlageAbend />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('switch')).toBeNull();
    expect(sheetSteps()).toHaveLength(4);
  });
});
