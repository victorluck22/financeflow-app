# DatePicker API

Componente unificado para selecao de data, periodo e data/hora no frontend.

## Import

```jsx
import { DatePicker } from "@/components/ui/date-picker";
```

## Props

- `mode`: `"single" | "range"` (default: `"single"`)
- `value`:
- single: `"YYYY-MM-DD"` ou `"YYYY-MM-DD HH:mm"` quando `enableTime=true`
- range: `{ startDate: string, endDate: string }`
- `onChange`: callback com mesmo formato de `value`
- `enableTime`: habilita seletor de hora 24h (`HH:mm`)
- `placeholder`: texto exibido quando nao ha valor
- `disabled`: desabilita interacao
- `numberOfMonths`: quantidade de meses no calendario (padrao 2 em range)

## Contrato de formato

- Persistencia (canonical): `YYYY-MM-DD` ou `YYYY-MM-DD HH:mm`
- Exibicao para usuario: `pt-BR` (`dd/MM/yyyy` e `dd/MM/yyyy HH:mm`)

## Exemplos

### Single date

```jsx
<DatePicker
  value={formData.date}
  onChange={(nextDate) => setFormData((prev) => ({ ...prev, date: nextDate }))}
/>
```

### Date range

```jsx
<DatePicker
  mode="range"
  value={filters.date}
  onChange={(nextRange) => setFilters((prev) => ({ ...prev, date: nextRange }))}
  placeholder="Selecione um periodo"
/>
```

### Date + time (24h)

```jsx
<DatePicker value={meetingDate} onChange={setMeetingDate} enableTime />
```
