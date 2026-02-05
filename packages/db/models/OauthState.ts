import {
  AllowNull,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

/**
 * Stores OAuth state server-side to avoid cookie domain issues with tunnels/proxies.
 * State is used as the primary key since it's the lookup key from OAuth callbacks.
 */
@Table({ modelName: 'OauthState' })
export class OauthState extends Model {
  /** The random state string sent to the OAuth provider */
  @PrimaryKey
  @Unique
  @Column(DataType.STRING(64))
  declare state: string;

  /** OAuth provider (e.g., 'strava', 'spotify') */
  @Column(DataType.STRING(32))
  declare provider: string;

  /** PKCE code verifier for providers that support it */
  @AllowNull
  @Column(DataType.STRING(128))
  declare codeVerifier: string | undefined;

  /** When this state expires (prevents replay attacks) */
  @Column(DataType.DATE)
  declare expiresAt: Date;
}
