import { compareSync, hashSync } from 'bcryptjs';

export class BcryptAdapter {
  /**
   * Hashea una contraseña
   * @param password - Contraseña en texto plano
   * @returns Contraseña hasheada
   */
  static hash(password: string): string {
    return hashSync(password, 10);
  }

  /**
   * Compara una contraseña en texto plano con un hash
   * @param password - Contraseña en texto plano
   * @param hashed - Contraseña hasheada
   * @returns true si coinciden, false si no
   */
  static compare(password: string, hashed: string): boolean {
    return compareSync(password, hashed);
  }
}
