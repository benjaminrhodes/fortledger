export const PHASE_I_VIABILITY_DAYS = 180;

export function phaseIViability(reportDate, asOf, viabilityDays = PHASE_I_VIABILITY_DAYS) {
  if (!reportDate || !asOf) return null;
  const report = Date.parse(`${reportDate}T00:00:00Z`);
  const end = Date.parse(`${asOf}T00:00:00Z`);
  if (!Number.isFinite(report) || !Number.isFinite(end)) return null;
  const ageDays = Math.round((end - report) / 86_400_000);
  const stale = ageDays > viabilityDays;
  return {
    reportDate,
    asOf,
    ageDays,
    viabilityDays,
    status: stale ? 'stale' : 'viable',
    rule: 'ASTM E1527-21 §4.6',
    note: stale
      ? `Report date is ${ageDays} days before ${asOf}, outside the 180-day Phase I viability window.`
      : `Report date is ${ageDays} days before ${asOf}, inside the 180-day Phase I viability window.`
  };
}
