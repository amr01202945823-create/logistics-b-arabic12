
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SettingsService {
  
  async getGlobalSettings() {
    // In production, add Redis caching here to reduce DB load
    const settings = await prisma.globalSetting.findUnique({
      where: { key: 'site_config' }
    });
    return settings?.value || {
      siteName: "Logistics B Arab",
      maintenanceMode: false,
      primaryColor: "#2563eb"
    };
  }

  async updateGlobalSetting(key: string, value: any, userId: string) {
    // Log the change
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_GLOBAL_SETTINGS',
        userId: userId,
        details: value
      }
    });

    return prisma.globalSetting.upsert({
      where: { key },
      update: { value, updatedBy: userId },
      create: { key, value, updatedBy: userId }
    });
  }

  async getSystemPrompts() {
    return prisma.systemPrompt.findMany();
  }

  async updateSystemPrompt(key: string, instruction: string, model: string = 'gemini-2.5-flash') {
    // Log this critical AI change
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_AI_PROMPT',
        resource: key,
        details: { model }
      }
    });

    return prisma.systemPrompt.upsert({
      where: { key },
      update: { systemInstruction: instruction, model },
      create: { key, systemInstruction: instruction, model }
    });
  }
}