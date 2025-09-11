import { supabase } from '@/integrations/supabase/client';
import { logService } from '@/services/logService';

/**
 * Interface para filtros genéricos de busca
 */
export interface BaseFilters {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Classe abstrata BaseRepository que implementa operações CRUD básicas
 * para qualquer tabela do Supabase. Segue o padrão Repository para
 * separar a lógica de acesso a dados da lógica de negócio.
 * 
 * @template TRow - Tipo da linha da tabela (Row)
 * @template TInsert - Tipo dos dados para inserção (Insert)
 * @template TUpdate - Tipo dos dados para atualização (Update)
 */
export abstract class BaseRepository<
  TRow extends Record<string, unknown>,
  TInsert extends Record<string, unknown>,
  TUpdate extends Record<string, unknown>
> {
  /**
   * Nome da tabela no Supabase - deve ser definido pelas classes filhas
   */
  protected abstract readonly tableName: string;

  /**
   * Cliente Supabase para acesso ao banco de dados
   */
  protected readonly client = supabase;

  /**
   * Obtém o usuário atual autenticado
   * @returns Promise com o ID do usuário ou null se não autenticado
   */
  protected async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      return user?.id || null;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.getCurrentUserId`);
      return null;
    }
  }

  /**
   * Busca todos os registros da tabela com filtros opcionais
   * Automatically filters by user_id if the table has this column
   */
  async findAll(filters: BaseFilters = {}): Promise<TRow[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      let query = this.client
        .from(this.tableName)
        .select('*')
        .is('deleted_at', null);

      // Filtrar por usuário se a tabela tem user_id
      // Assumimos que todas as tabelas têm user_id
      query = query.eq('user_id', userId);

      // Aplicar ordenação
      const orderBy = filters.orderBy || 'created_at';
      const orderDirection = filters.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Aplicar paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logService.logError(error, `${this.constructor.name}.findAll`);
        throw new Error(`Erro ao buscar registros: ${error.message}`);
      }

      return data as TRow[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findAll`);
      throw error;
    }
  }

  /**
   * Busca um registro específico por ID
   */
  async findById(id: string): Promise<TRow | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        logService.logError(error, `${this.constructor.name}.findById`);
        throw new Error(`Erro ao buscar registro: ${error.message}`);
      }

      return data as TRow || null;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findById`);
      throw error;
    }
  }

  /**
   * Cria um novo registro
   */
  async create(data: TInsert): Promise<TRow> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      // Adicionar user_id e timestamps automaticamente
      const insertData = {
        ...data,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as TInsert;

      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logService.logError(error, `${this.constructor.name}.create`);
        throw new Error(`Erro ao criar registro: ${error.message}`);
      }

      logService.logInfo(
        `Registro criado com sucesso na tabela ${this.tableName}`,
        { id: (result as TRow & { id: string }).id },
        this.constructor.name
      );

      return result as TRow;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.create`);
      throw error;
    }
  }

  /**
   * Atualiza um registro existente
   */
  async update(id: string, data: TUpdate): Promise<TRow> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      // Adicionar timestamp de atualização automaticamente
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      } as TUpdate;

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        logService.logError(error, `${this.constructor.name}.update`);
        throw new Error(`Erro ao atualizar registro: ${error.message}`);
      }

      logService.logInfo(
        `Registro atualizado com sucesso na tabela ${this.tableName}`,
        { id },
        this.constructor.name
      );

      return result as TRow;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.update`);
      throw error;
    }
  }

  /**
   * Remove um registro (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await this.client
        .from(this.tableName)
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as TUpdate)
        .eq('id', id)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        logService.logError(error, `${this.constructor.name}.delete`);
        throw new Error(`Erro ao excluir registro: ${error.message}`);
      }

      logService.logInfo(
        `Registro excluído com sucesso da tabela ${this.tableName}`,
        { id },
        this.constructor.name
      );
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.delete`);
      throw error;
    }
  }

  /**
   * Verifica se um registro existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return false;
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        logService.logError(error, `${this.constructor.name}.exists`);
        return false;
      }

      return !!data;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.exists`);
      return false;
    }
  }

  /**
   * Conta o número total de registros (útil para paginação)
   */
  async count(): Promise<number> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return 0;
      }

      const { count, error } = await this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        logService.logError(error, `${this.constructor.name}.count`);
        throw new Error(`Erro ao contar registros: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.count`);
      return 0;
    }
  }

  /**
   * Método auxiliar para construir queries complexas
   * Permite às classes filhas construir queries personalizadas
   */
  protected createQuery() {
    return this.client.from(this.tableName);
  }

  /**
   * Método auxiliar para aplicar filtro de usuário em queries personalizadas
   */
  protected async applyUserFilter(query: ReturnType<typeof this.createQuery>) {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return query.eq('user_id', userId).is('deleted_at', null);
  }
}