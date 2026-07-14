import { randomUUID } from 'node:crypto';

export abstract class Entity<
  Props extends Record<string, unknown> = Record<string, unknown>,
> {
  public readonly _id: string;
  public readonly props: Props;

  constructor(props: Props, id?: string) {
    this.props = props;
    this._id = id || randomUUID();
  }

  get id(): string {
    return this._id;
  }

  toJSON(): { id: string } & Props {
    return {
      id: this._id,
      ...this.props,
    };
  }
}
