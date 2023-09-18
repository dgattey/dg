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
  name!: string;

  @AllowNull
  @Column(DataType.STRING(768))
  accessToken: string | undefined;

  @AllowNull
  @Column(DataType.STRING(768))
  refreshToken: string | undefined;

  @AllowNull
  @Column(DataType.DATE)
  expiryAt: Date | undefined;
}
