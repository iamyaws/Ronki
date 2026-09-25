import React, { useState } from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Pearl } from './CurrencyIcons';
import BelohnungRedeemModal from './BelohnungRedeemModal';
import TopBar from './TopBar';
import { PaperCard, PillButton, DoodleIcon, RonkiArt } from './bilderbuch';

/**
 * Belohnungsbank, the Laden: the kid's reward shop, Sterne only.
 *
 * Bilderbuch cut, 25 Sep 2026. Sun is praise: white ground, Ronki
 * cheering in the header next to the star count on a sun sticker,
 * every reward a paper card with the gift doodle, one cobalt pill to
 * redeem where the Sterne suffice, the parent lock through the shared
 * top bar. The teal hero, its image and the Material glyphs are gone.
 *
 * Behaviour unchanged: DEFAULT_BELOHNUNGEN filtered to active Sterne
 * rewards, the redeem modal, actions.redeemReward.
 */

export default function Belohnungsbank({ onNavigate, onOpenParental }) {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const hp = state?.hp || 0;
  const [redeemTarget, setRedeemTarget] = useState(null);

  const familyRewards = DEFAULT_BELOHNUNGEN.filter(
    b => b.active && (b.currency || 'hp') === 'hp',
  );

  return (
    <div className="relative bg-white text-ink pb-32" style={{ minHeight: '100dvh' }}>
      <TopBar onNavigate={onNavigate} view="shop" onOpenParental={onOpenParental} />

      {/* Header: Ronki cheers, the Sterne shine on a sun sticker. */}
      <section style={{ padding: '4px 16px 0' }}>
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1" style={{ paddingBottom: 6 }}>
            <p className="bb-hand text-cobalt uppercase" style={{ fontSize: 18, lineHeight: 1, marginBottom: 6 }}>
              {t('shop.header.eyebrow')}
            </p>
            <h1 className="bb-display" style={{ fontSize: 32 }}>
              {t('shop.header.title')}
            </h1>
            <p className="font-body text-ink-soft" style={{ fontSize: 16, lineHeight: 1.4, marginTop: 6 }}>
              {t('shop.header.subtitle')}
            </p>
          </div>
          <RonkiArt pose="cheer" animated size={136} className="shrink-0" style={{ marginBottom: -6 }} />
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full bg-sun text-ink"
          style={{ marginTop: 10, padding: '8px 18px 8px 12px', border: '3px solid var(--color-ink)', transform: 'rotate(-1.5deg)' }}
          aria-label={`${hp} Sterne`}
        >
          <Pearl size={30} />
          <span className="bb-display" style={{ fontSize: 30, lineHeight: 1 }}>{hp}</span>
          <span className="bb-hand" style={{ fontSize: 20, lineHeight: 1, marginTop: 4 }}>Sterne</span>
        </div>
        <p className="bb-hand text-ink-soft" style={{ fontSize: 17, lineHeight: 1, marginTop: 10, marginLeft: 6 }}>
          Für Belohnungen aus dem Leben
        </p>
      </section>

      <div className="flex flex-col" style={{ padding: '22px 16px 24px', gap: 24 }}>
        {/* Family adventures (Sterne only) */}
        {familyRewards.length > 0 && (
          <div className="flex flex-col" style={{ gap: 12 }}>
            <div className="flex items-center gap-2" style={{ padding: '0 2px' }}>
              <DoodleIcon name="gift" size={26} />
              <h2 className="bb-display" style={{ fontSize: 24, margin: 0 }}>
                {t('shop.familyAdventures')}
              </h2>
            </div>
            <div className="flex flex-col" style={{ gap: 12 }}>
              {familyRewards.map(reward => (
                <RewardRow
                  key={reward.id}
                  reward={reward}
                  name={t('bel.' + reward.id)}
                  canAfford={hp >= reward.cost}
                  balance={hp}
                  ctaLabel={t('shop.redeem')}
                  onRedeem={() => setRedeemTarget({ ...reward, name: t('bel.' + reward.id) })}
                />
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <PaperCard tone="sky-wash" pad="md" className="grid items-start gap-3" style={{ gridTemplateColumns: '36px 1fr' }}>
          <DoodleIcon name="sparkle" size={32} filled style={{ color: 'var(--color-cobalt)', marginTop: 2 }} />
          <div>
            <b className="font-headline font-bold block" style={{ fontSize: 18, lineHeight: 1.2, marginBottom: 4 }}>
              {t('shop.howItWorks')}
            </b>
            <p className="font-body m-0" style={{ fontSize: 16, lineHeight: 1.45 }}>
              {t('shop.howItWorksBody')}
            </p>
          </div>
        </PaperCard>
      </div>

      {/* Reward approval modal */}
      {redeemTarget && (
        <BelohnungRedeemModal
          reward={redeemTarget}
          onApprove={() => {
            actions.redeemReward('hp', redeemTarget.cost);
            setRedeemTarget(null);
          }}
          onDismiss={() => setRedeemTarget(null)}
        />
      )}
    </div>
  );
}

function RewardRow({ reward, name, canAfford, balance, ctaLabel, onRedeem }) {
  const remaining = Math.max(0, reward.cost - balance);
  const pct = Math.min(100, (balance / reward.cost) * 100);
  return (
    <PaperCard tone={canAfford ? 'paper' : 'white'} pad="sm" lift={canAfford} className="flex flex-col" style={{ gap: 12, padding: 14 }}>
      <div className="grid items-center" style={{ gridTemplateColumns: '64px 1fr', gap: 12 }}>
        <div
          aria-hidden="true"
          className="flex items-center justify-center rounded-[20px] bg-white shrink-0"
          style={{ width: 64, height: 64, border: '2.5px solid var(--color-ink)', color: canAfford ? 'var(--color-cobalt)' : 'var(--color-ink)' }}
        >
          <DoodleIcon name="gift" size={36} />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline font-bold m-0" style={{ fontSize: 19, lineHeight: 1.2 }}>
            {name}
          </h3>
          <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 4 }}>
            <span className="inline-flex items-center font-headline font-semibold" style={{ gap: 5, fontSize: 17 }}>
              <Pearl size={18} />
              {reward.cost}
            </span>
            {!canAfford && (
              <span className="font-body text-ink-soft" style={{ fontSize: 16 }}>
                Noch <b className="text-ink">{remaining}</b> Sterne
              </span>
            )}
          </div>
          {/* A drawn bar: how far the Sterne reach. */}
          <div
            className="overflow-hidden rounded-full bg-white"
            style={{ marginTop: 8, height: 12, border: '2px solid var(--color-ink)' }}
            aria-hidden="true"
          >
            <div className="h-full rounded-full bg-cobalt transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      {canAfford && (
        <PillButton full icon="gift" onClick={onRedeem}>
          {ctaLabel}
        </PillButton>
      )}
    </PaperCard>
  );
}
