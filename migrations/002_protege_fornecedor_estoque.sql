-- Protege o fornecedor de estoque interno (Auto Almeida, eh_estoque=true):
-- não pode ser editado nem removido (nem soft-delete via ativo=false).
-- Rodar no SQL Editor do Supabase.

create or replace function protege_fornecedor_estoque()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if old.eh_estoque then
      raise exception 'O fornecedor de estoque interno (Auto Almeida) não pode ser removido.';
    end if;
    return old;
  else -- UPDATE
    if old.eh_estoque then
      raise exception 'O fornecedor de estoque interno (Auto Almeida) não pode ser editado.';
    end if;
    return new;
  end if;
end;
$$;

drop trigger if exists trg_protege_fornecedor_estoque on fornecedores;
create trigger trg_protege_fornecedor_estoque
  before update or delete on fornecedores
  for each row execute function protege_fornecedor_estoque();
