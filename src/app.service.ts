import { Injectable } from '@nestjs/common';
import {
  GetTvlRequest,
  GetTvlReply,
  GetPoolAndTokenVolumesRequest,
  GetPoolAndTokenVolumesReply,
} from './generated/dappradar-proto/defi-providers';
import { FactoryService } from './factory/factory.service';

@Injectable()
export class AppService {
  constructor(private readonly factoryService: FactoryService) {}

  async getTvl(req: GetTvlRequest): Promise<GetTvlReply> {
    return await this.factoryService.getTvl(req);
  }

  async getPoolAndTokenVolumes(
    req: GetPoolAndTokenVolumesRequest,
  ): Promise<GetPoolAndTokenVolumesReply> {
    return await this.factoryService.getPoolAndTokenVolumes(req);
  }
}
