export class Statics {
  static readonly projectName : string = 'brp-notificaties';

  /**
   * DNS parameters
   */
  static readonly ssmEnvRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly ssmEnvRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';

  static readonly ssmZoneId: string = '/gemeente-nijmegen/brp/notificaties/hostedzone/id';
  static readonly ssmZoneName: string = '/gemeente-nijmegen/brp/notificaties/hostedzone/name';

  static readonly ssmAccountDnsSecKmsKey: string = '/gemeente-nijmegen/account/dnssec/kmskey/arn';

  /**
   * Pipeline values
   */
  static readonly codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-west-1:418648875085:connection/4f647929-c982-4f30-94f4-24ff7dbf9766';
  static readonly projectRepo : string = 'GemeenteNijmegen/brp-notificaties';

}