'use client'

import { useState, useTransition } from 'react'
import { Avatar } from './Avatar'
import { saveAvatarConfigAction } from '@/app/actions/avatar'
import { setItemEquippedAction } from '@/app/actions/shop'
import type { AvatarConfig } from './AvatarConfig'
import {
  SKIN_TONES,
  EYE_COLORS,
  EYE_STYLES,
  NOSE_STYLES,
  BROW_STYLES,
  MOUTH_STYLES,
  BODY_TYPES,
  HEIGHT_TYPES,
  HAIR_STYLES,
  GENDERS,
  HAIR_COLORS,
  SKIN_HEX,
  EYE_HEX,
  HAIR_COLOR_HEX,
  SKIN_LABELS,
  EYE_COLOR_LABELS,
  EYE_STYLE_LABELS,
  NOSE_STYLE_LABELS,
  BROW_STYLE_LABELS,
  MOUTH_STYLE_LABELS,
  BODY_TYPE_LABELS,
  HEIGHT_LABELS,
  HAIR_STYLE_LABELS,
  HAIR_COLOR_LABELS,
  GENDER_LABELS,
} from './AvatarConfig'
import { cn } from '@/presentation/lib/utils'

interface OwnedVisualItem {
  id: string
  name: string
  category: string
  icon: string
}

interface AvatarEditorProps {
  initialConfig: AvatarConfig
  ownedItemNames?: string[]
  ownedVisualItems?: OwnedVisualItem[]
  initialEquippedIds?: string[]
}

type Tab = 'aparencia' | 'tracos' | 'corpo' | 'acessorios'

// ─── Picker genérico de estilo ───────────────────────────────

function StylePicker<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="text-xs font-bold text-matema-muted uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
              value === opt
                ? 'border-matema-primary text-matema-primary bg-matema-primary/10'
                : 'border-matema-border text-matema-muted hover:border-matema-dark hover:text-matema-dark',
            )}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Editor principal ────────────────────────────────────────

export function AvatarEditor({
  initialConfig,
  ownedItemNames = [],
  ownedVisualItems = [],
  initialEquippedIds = [],
}: AvatarEditorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig)
  const [tab, setTab] = useState<Tab>('aparencia')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [equippedIds, setEquippedIds] = useState<Set<string>>(new Set(initialEquippedIds))
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function set<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
    setSaveError(null)
  }

  function toggleEquip(item: OwnedVisualItem) {
    const next = !equippedIds.has(item.id)
    setTogglingId(item.id)
    startTransition(async () => {
      await setItemEquippedAction(item.id, next)
      setEquippedIds((prev) => {
        const s = new Set(prev)
        if (next) s.add(item.id)
        else s.delete(item.id)
        return s
      })
      setTogglingId(null)
    })
  }

  function handleSave() {
    setSaved(false)
    setSaveError(null)
    startTransition(async () => {
      const result = await saveAvatarConfigAction(config)
      if (result.success) setSaved(true)
      else setSaveError(result.error ?? 'Erro ao salvar')
    })
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'aparencia',  label: 'Aparência',  icon: '🎨' },
    { id: 'tracos',     label: 'Traços',     icon: '✏️' },
    { id: 'corpo',      label: 'Corpo',      icon: '💪' },
    { id: 'acessorios', label: 'Acessórios', icon: '✨' },
  ]

  // Nomes equipados dinamicamente para a prévia do avatar
  const equippedNames = ownedVisualItems
    .filter((i) => equippedIds.has(i.id))
    .map((i) => i.name)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Layout: prévia + painel */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Prévia do avatar */}
        <div className="flex-shrink-0 flex flex-col items-center bg-white rounded-3xl border border-matema-border p-6 md:w-52">
          <p className="text-xs font-semibold text-matema-muted mb-4 uppercase tracking-wide">Prévia</p>
          <Avatar config={config} ownedItemNames={equippedNames.length > 0 ? equippedNames : ownedItemNames} size={140} />
          {equippedNames.length > 0 && (
            <p className="text-xs text-matema-muted mt-3 text-center">
              {equippedNames.length} item{equippedNames.length !== 1 ? 'ns' : ''} equipado{equippedNames.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Painel de edição */}
        <div className="flex-1 bg-white rounded-3xl border border-matema-border overflow-hidden">
          {/* Abas */}
          <div className="flex border-b border-matema-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5',
                  tab === t.id
                    ? 'text-matema-primary border-b-2 border-matema-primary bg-matema-primary/5'
                    : 'text-matema-muted hover:text-matema-dark hover:bg-matema-warm',
                )}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Conteúdo da aba */}
          <div className="p-5 space-y-6">
            {/* ── Aparência ── */}
            {tab === 'aparencia' && (
              <>
                {/* Gênero */}
                <div>
                  <p className="text-xs font-bold text-matema-muted uppercase tracking-wide mb-2">Gênero</p>
                  <div className="flex gap-3">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        onClick={() => set('gender', g)}
                        className={cn(
                          'flex-1 py-3 rounded-2xl text-base font-bold border-2 transition-all',
                          config.gender === g
                            ? 'border-matema-primary text-matema-primary bg-matema-primary/10'
                            : 'border-matema-border text-matema-muted hover:border-matema-dark hover:text-matema-dark',
                        )}
                      >
                        {GENDER_LABELS[g]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tom de pele */}
                <div>
                  <p className="text-xs font-bold text-matema-muted uppercase tracking-wide mb-3">
                    Tom de pele
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {SKIN_TONES.map((s) => (
                      <button
                        key={s}
                        title={SKIN_LABELS[s]}
                        onClick={() => set('skinTone', s)}
                        className={cn(
                          'w-10 h-10 rounded-full border-4 transition-all hover:scale-110 focus:outline-none',
                          config.skinTone === s
                            ? 'border-matema-primary scale-110 shadow-md shadow-matema-primary/30'
                            : 'border-white shadow-sm',
                        )}
                        style={{ backgroundColor: SKIN_HEX[s] }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-matema-muted mt-2 font-medium">{SKIN_LABELS[config.skinTone]}</p>
                </div>

                {/* Cor dos olhos */}
                <div>
                  <p className="text-xs font-bold text-matema-muted uppercase tracking-wide mb-3">
                    Cor dos olhos
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {EYE_COLORS.map((c) => (
                      <button
                        key={c}
                        title={EYE_COLOR_LABELS[c]}
                        onClick={() => set('eyeColor', c)}
                        className={cn(
                          'w-10 h-10 rounded-full border-4 transition-all hover:scale-110 focus:outline-none',
                          config.eyeColor === c
                            ? 'border-matema-primary scale-110 shadow-md shadow-matema-primary/30'
                            : 'border-white shadow-sm',
                        )}
                        style={{ backgroundColor: EYE_HEX[c] }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-matema-muted mt-2 font-medium">{EYE_COLOR_LABELS[config.eyeColor]}</p>
                </div>

                {/* Cor do cabelo */}
                <div>
                  <p className="text-xs font-bold text-matema-muted uppercase tracking-wide mb-3">
                    Cor do cabelo
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c}
                        title={HAIR_COLOR_LABELS[c]}
                        onClick={() => set('hairColor', c)}
                        className={cn(
                          'w-10 h-10 rounded-full border-4 transition-all hover:scale-110 focus:outline-none',
                          config.hairColor === c
                            ? 'border-matema-primary scale-110 shadow-md shadow-matema-primary/30'
                            : 'border-white shadow-sm',
                        )}
                        style={{ backgroundColor: HAIR_COLOR_HEX[c] }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-matema-muted mt-2 font-medium">{HAIR_COLOR_LABELS[config.hairColor]}</p>
                </div>
              </>
            )}

            {/* ── Traços ── */}
            {tab === 'tracos' && (
              <>
                <StylePicker
                  label="Cabelo"
                  options={HAIR_STYLES}
                  labels={HAIR_STYLE_LABELS}
                  value={config.hairStyle}
                  onChange={(v) => set('hairStyle', v)}
                />
                <StylePicker
                  label="Olhos"
                  options={EYE_STYLES}
                  labels={EYE_STYLE_LABELS}
                  value={config.eyeStyle}
                  onChange={(v) => set('eyeStyle', v)}
                />
                <StylePicker
                  label="Sobrancelhas"
                  options={BROW_STYLES}
                  labels={BROW_STYLE_LABELS}
                  value={config.browStyle}
                  onChange={(v) => set('browStyle', v)}
                />
                <StylePicker
                  label="Nariz"
                  options={NOSE_STYLES}
                  labels={NOSE_STYLE_LABELS}
                  value={config.noseStyle}
                  onChange={(v) => set('noseStyle', v)}
                />
                <StylePicker
                  label="Boca"
                  options={MOUTH_STYLES}
                  labels={MOUTH_STYLE_LABELS}
                  value={config.mouthStyle}
                  onChange={(v) => set('mouthStyle', v)}
                />
              </>
            )}

            {/* ── Corpo ── */}
            {tab === 'corpo' && (
              <>
                <StylePicker
                  label="Tipo de corpo"
                  options={BODY_TYPES}
                  labels={BODY_TYPE_LABELS}
                  value={config.bodyType}
                  onChange={(v) => set('bodyType', v)}
                />
                <StylePicker
                  label="Altura"
                  options={HEIGHT_TYPES}
                  labels={HEIGHT_LABELS}
                  value={config.heightType}
                  onChange={(v) => set('heightType', v)}
                />
              </>
            )}

            {/* ── Acessórios ── */}
            {tab === 'acessorios' && (
              <>
                {ownedVisualItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <span className="text-5xl">🛍️</span>
                    <p className="font-bold text-matema-dark">Nenhum item ainda</p>
                    <p className="text-sm text-matema-muted">
                      Compre acessórios e avatares na <a href="/loja" className="text-matema-primary underline">Loja</a> com suas moedas!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {ownedVisualItems.map((item) => {
                      const equipped = equippedIds.has(item.id)
                      const loading  = togglingId === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleEquip(item)}
                          disabled={loading}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all',
                            equipped
                              ? 'border-matema-primary bg-matema-primary/5 text-matema-primary'
                              : 'border-matema-border bg-matema-warm text-matema-dark hover:border-matema-dark',
                            loading && 'opacity-60',
                          )}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{item.name}</p>
                            <p className="text-xs mt-0.5 font-medium">
                              {equipped ? '✓ Equipado' : 'Equipar'}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botão salvar */}
      <div className="flex items-center gap-4 justify-end">
        {saved && (
          <p className="text-sm text-green-600 font-semibold animate-fade-in">✓ Avatar salvo!</p>
        )}
        {saveError && (
          <p className="text-sm text-red-500 font-semibold">{saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-matema-primary text-white font-bold px-8 py-3 rounded-2xl hover:bg-matema-primary/90 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Salvando...' : 'Salvar avatar'}
        </button>
      </div>
    </div>
  )
}
