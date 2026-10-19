import { Pipe, PipeTransform } from '@angular/core';
import { TemperatureUnit } from '../../core/models/air-fryer-profile.model';

@Pipe({
  name: 'temperatureUnit',
  standalone: true,
})
export class TemperatureUnitPipe implements PipeTransform {
  transform(tempCelsius: number | null | undefined, unit: TemperatureUnit = 'C'): string {
    const safeC = tempCelsius ?? 180;
    if (unit === 'F') {
      const f = Math.round(((safeC * 9) / 5 + 32) / 5) * 5;
      return `${f} °F`;
    }
    return `${safeC} °C`;
  }
}

