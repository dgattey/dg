import {
  Table,
  Column,
  Model,
  Unique,
  PrimaryKey,
  DataType,
  AllowNull,
} from 'sequelize-typescript';

export type CreateTokenProps = Pick<Token, 'name' | 'accessToken' | 'expiryAt' | 'refreshToken'>;
export type FetchTokenProps = Pick<Token, 'name'>;

@Table({ modelName: 'Token' })
export class Token extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull
  @Column(DataType.STRING(768))
  declare accessToken: string | undefined;

  @AllowNull
  @Column(DataType.STRING(768))
  declare refreshToken: string | undefined;

  @AllowNull
  @Column(DataType.DATE)
  declare expiryAt: Date | undefined;
}
