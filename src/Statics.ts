export class Statics {
  static readonly projectName : string = 'brp-notificaties';

  /**
   * DNS parameters
   */
  static readonly ssmEnvRootHostedParams: string = '/gemeente-nijmegen/account/hostedzone/';
  static readonly ssmEnvRootHostedZoneId: string = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly ssmEnvRootHostedZoneName: string = '/gemeente-nijmegen/account/hostedzone/name';

  static readonly ssmZoneId: string = '/gemeente-nijmegen/brp-notificaties/hostedzone/id';
  static readonly ssmZoneName: string = '/gemeente-nijmegen/brp-notificaties/hostedzone/name';

  static readonly ssmAccountDnsSecKmsKey: string = '/gemeente-nijmegen/account/dnssec/kmskey/arn';

  /**
   * Internal SSM parameters
   */
  static readonly ssmApiGatewayId: string = '/gemeente-nijmegen/brp-notificaties/api-gateway/id';

  /**
   * Pipeline values
   */
  static readonly codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-west-1:418648875085:connection/4f647929-c982-4f30-94f4-24ff7dbf9766';
  static readonly projectRepo : string = 'GemeenteNijmegen/brp-notificaties';


  /**
   * Functions to check branch
   */

  static isDevelopment(branch: string | undefined) : boolean {
    return branch != 'acceptance' && branch != 'production';
  }

  static isAcceptance(branch: string | undefined) : boolean {
    return branch == 'acceptance';
  }

  static isProduction(branch: string | undefined) : boolean {
    return branch == 'production';
  }

}