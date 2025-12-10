
module live_concert::live_concert {
    use iota::coin::Coin;
    use iota::iota::IOTA; 
    use iota::tx_context::sender;
    use iota::object::{new, delete};
    use iota::transfer::{public_transfer,share_object};
    use iota::bag::{Bag,new as newBag, remove};

    public struct TicketNFT has key, store {
        id: UID,
        ticket_type: vector<u8>,
        price: u64,
        owner:address,
        resale_limit:u64
    }

    public struct Creator has key, store{
        id:UID,
        address: address
    }

    public struct TotalTicket has key, store{
        id: UID,
        value: u64,
        silver: u64,
        gold: u64,
        platinium: u64
    } 
    public struct SoldTicket has key, store{
        id: UID,
        value: u64,
        silver: u64,
        gold: u64,
        platinium: u64
    } 

    public struct InitiateResale has key, store {
        id: UID,
        nft:TicketNFT,
        seller:address,
        price:u64,
    }

    public struct Category has key, store {
        id: UID,
        categories_bag: Bag
    }

    const SILVER_TICKET_PRICE: u64 = 500; 
    const GOLD_TICKET_PRICE: u64 = 1000;
    const PLATINIUM_TICKET_PRICE: u64 = 2000;
    const RESALE_LIMIT: u64 = 5;

    #[error]
    const ENOTCREATOR: vector<u8> = b"Only owner can mint new tickets";
    #[error]
    const ENOTENOUGHFUNDS: vector<u8> = b"Insufficient funds for gas and NFT transfer";
    #[error]
    const EINVALIDCATEGORY: vector<u8> = b"Invalid category";
    #[error]
    const ERESALELIMITREACHED: vector<u8> = b"The nft resale limit has been reached";
    #[error]
    const NOT_OWNER: vector<u8> = b"Sender is not owner";

    fun init(ctx: &mut TxContext) {
        share_object(Creator{
            id: new(ctx),
            address:sender(ctx)
        });
        share_object(TotalTicket {
            id: new(ctx),
            value: 500,
            silver: 300,
            gold: 150,
            platinium: 50,
        });

        let mut categories_bag = newBag(ctx);
        categories_bag.add(b"SILVER_TICKET",SILVER_TICKET_PRICE);
        categories_bag.add(b"GOLD_TICKET",GOLD_TICKET_PRICE);
        categories_bag.add(b"PLATINIUM_TICKET",PLATINIUM_TICKET_PRICE);

        share_object(Category {
            id: new(ctx),
            categories_bag
        });

        share_object(SoldTicket {
            id: new(ctx),
            value: 0,
            silver: 0,
            gold: 0,
            platinium: 0
        });
    }

    #[allow(lint(self_transfer))]
    public fun buy_ticket(
        coin: &mut Coin<IOTA>,
        creator: &mut Creator,
        category: vector<u8>, 
        categories: &mut Category,
        total_ticket: &mut TotalTicket,
        sold_ticket: &mut SoldTicket,
        ctx: &mut TxContext
    ) {
        assert!(check_category(category),EINVALIDCATEGORY);

        let total_ticket_field_price = get_total_ticket_field(category, total_ticket);
        let sold_ticket_field_price = get_sold_ticket_field(category, sold_ticket);

        let actual_price = ((categories.categories_bag[category]/100)*((sold_ticket_field_price/total_ticket_field_price)*100))+categories.categories_bag[category];
        assert!(coin.balance().value()>=actual_price, ENOTENOUGHFUNDS);

        let sender = sender(ctx);

        let new_nft = TicketNFT {
            id: new(ctx),
            ticket_type: category,
            price: actual_price,
            owner:sender,
            resale_limit:RESALE_LIMIT
        };

        sold_ticket.value = sold_ticket.value + 1;
        update_sold_ticket(category,sold_ticket);

        let new_coin = coin.split(actual_price,ctx);

        public_transfer(new_coin,creator.address);
        public_transfer(new_nft,sender);
    }

    public fun change_price(
        creator: &mut Creator, 
        category: vector<u8>,
        updated_price:u64,
        categories: &mut Category,
        ctx: &mut TxContext) {
        let sender = sender(ctx);

        assert!(sender==creator.address, ENOTCREATOR);
        assert!(check_category(category),EINVALIDCATEGORY);

        remove<vector<u8>,u64>(&mut categories.categories_bag,category);
        categories.categories_bag.add(category,updated_price);
    }

    public fun resale(nft: TicketNFT, resale_price: u64, ctx: &mut TxContext) {
        assert!(nft.resale_limit>0,ERESALELIMITREACHED);

        let sender = sender(ctx);
        assert!(nft.owner==sender,NOT_OWNER);

        let initiated_resale = InitiateResale {
            id: new(ctx),
            nft,
            seller:sender,
            price:resale_price,
        };

        share_object(initiated_resale);
    }

    #[allow(unused_variable,lint(self_transfer))]
    public fun buy_resale_ticket(
        coin: &mut Coin<IOTA>,
        initiated_resale: InitiateResale,
        ctx: &mut TxContext
    ) {
        let sender = sender(ctx);

        let InitiateResale {id,mut nft,seller,price} = initiated_resale;

        let previous_owner = nft.owner;
        nft.owner = sender;
        nft.price = price;
        nft.resale_limit = nft.resale_limit-1;

        let new_coin = coin.split(price,ctx);
        
        public_transfer(new_coin, previous_owner);
        public_transfer(nft,sender);

        delete(id);
    }

    fun check_category(category: vector<u8>): bool {
        match (category) {
            b"GOLD_TICKET" => true,
            b"SILVER_TICKET" => true,
            b"PLATINIUM_TICKET" => true,
            _ => false,
        }
    }

    #[allow(unused_mut_parameter)]
    fun get_sold_ticket_field(category: vector<u8>, sold_ticket: &mut SoldTicket): u64 {
        match (category) {
            b"GOLD_TICKET" => sold_ticket.gold,
            b"SILVER_TICKET" => sold_ticket.silver,
            _ => sold_ticket.platinium,
        }
    }
    
    #[allow(unused_mut_parameter)]
    fun get_total_ticket_field(category: vector<u8>, total_ticket: &mut TotalTicket): u64 {
        match (category) {
            b"GOLD_TICKET" => total_ticket.gold,
            b"SILVER_TICKET" => total_ticket.silver,
            _ => total_ticket.platinium,
        }
    }

    fun update_sold_ticket(category: vector<u8>, sold_ticket: &mut SoldTicket) {
        if(category==b"GOLD_TICKET") {
            sold_ticket.gold = sold_ticket.gold + 1;
        } else if(category==b"SILVER_TICKET") {
            sold_ticket.silver = sold_ticket.silver + 1;
        } else {
            sold_ticket.platinium = sold_ticket.platinium + 1;
        }
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}