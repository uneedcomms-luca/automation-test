export class ServiceGroup {
  idx?: number = 0;
  vendorKey?: "CAFE24" | "MAKESHOP" | "IMWEB";
  KGJS_domain?: string;

  constructor(idx: string | number, serviceGroup?: ServiceGroup) {
    this.idx = Number(idx);
    try {
    } catch (e) {
      this.idx = 0;
    }
    if (!serviceGroup) return;

    this.vendorKey = serviceGroup?.vendorKey;
    this.KGJS_domain = serviceGroup?.KGJS_domain;
  }
}
