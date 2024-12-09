import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { supabaseAnonimousKey, supabaseUrl } from '../vars';


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonimousKey);
