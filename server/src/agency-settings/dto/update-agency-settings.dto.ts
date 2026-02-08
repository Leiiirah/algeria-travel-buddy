import { IsObject } from 'class-validator';

export class UpdateAgencySettingsDto {
  @IsObject()
  settings: Record<string, string>;
}
