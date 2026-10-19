import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  standalone: true,
})
export class DurationFormatPipe implements PipeTransform {
  transform(seconds: number | null | undefined, style: 'clock' | 'human' = 'clock'): string {
    const safeSec = Math.max(0, Math.round(seconds ?? 0));
    const mins = Math.floor(safeSec / 60);
    const secs = safeSec % 60;

    if (style === 'human') {
      if (mins === 0) return `${secs} s`;
      if (secs === 0) return `${mins} min`;
      return `${mins} min ${secs} s`;
    }

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

