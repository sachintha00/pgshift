export interface Migration {
  up: (client: any) => Promise<void>;
  down: (client: any) => Promise<void>;
  name: string;
}

export interface Seeder {
  seed: (client: any) => Promise<void>;
  name: string;
}
