#[test_only]
module live_concert::live_concert_tests {
    use iota::coin;
    use iota::iota::IOTA;
    use iota::test_scenario::{Self, Scenario};
    use live_concert :: live_concert :: {
        TicketNFT,
        Creator,
        TotalTicket,
        SoldTicket,
        InitiateResale,
        Category,
        buy_ticket,
        resale,
        change_price,
        buy_resale_ticket,
        test_init
    };

    const CREATOR: address = @0xBBBB;
    const BUYER: address = @0xCCCC;

    #[test]
    fun test_buy_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        let (
            mut creator,
            mut categories,
            mut total_ticket,
            mut sold_ticket
        ) = get_shared(test);
        

        let mut new_coin = coin::mint_for_testing<IOTA>(5000,test_scenario::ctx(test));

        test_scenario::next_tx(test,CREATOR);
        buy_ticket(
            &mut new_coin,
            &mut creator,
            b"GOLD_TICKET", 
            &mut categories,
            &mut total_ticket, 
            &mut sold_ticket,
            test_scenario::ctx(test)
        );
        
        return_shared(
            creator,
            categories,
            total_ticket,
            sold_ticket
        );

        test_scenario::next_tx(test,CREATOR);
        let nft = test_scenario::take_from_sender<TicketNFT>(test);
        test_scenario::return_to_sender<TicketNFT>(test,nft);
        new_coin.burn_for_testing();
        test_scenario::end(scenario);
    }

    #[test,allow(unused_let_mut)]
    fun test_change_price() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        let (
            mut creator,
            mut categories,
            mut total_ticket,
            mut sold_ticket
        ) = get_shared(test);

        test_scenario::next_tx(test,CREATOR);
        change_price(
            &mut creator,
            b"GOLD_TICKET",
            1300,
            &mut categories,
            test_scenario::ctx(test)
        );

        return_shared(
            creator,
            categories,
            total_ticket,
            sold_ticket
        );
        test_scenario::end(scenario);
    }

    #[test]
    fun test_resale() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        let (
            mut creator,
            mut categories,
            mut total_ticket,
            mut sold_ticket
        ) = get_shared(test);
        

        let mut new_coin = coin::mint_for_testing<IOTA>(5000,test_scenario::ctx(test));

        test_scenario::next_tx(test,CREATOR);
        buy_ticket(
            &mut new_coin,
            &mut creator,
            b"GOLD_TICKET", 
            &mut categories,
            &mut total_ticket, 
            &mut sold_ticket,
            test_scenario::ctx(test)
        );

        test_scenario::next_tx(test,CREATOR);
        let nft = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        resale(
            nft,
            1400,
            test_scenario::ctx(test)
        );
        
        test_scenario::next_tx(test,CREATOR);
        let initiated_resale = test_scenario::take_shared<InitiateResale>(test);

        return_shared(
            creator,
            categories,
            total_ticket,
            sold_ticket
        );

        test_scenario::next_tx(test,CREATOR);
        test_scenario::return_shared<InitiateResale>(initiated_resale);
        new_coin.burn_for_testing();
        test_scenario::end(scenario);
    }

    #[test]
    fun test_buy_resale() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        let (
            mut creator,
            mut categories,
            mut total_ticket,
            mut sold_ticket
        ) = get_shared(test);
        

        let mut new_coin = coin::mint_for_testing<IOTA>(5000,test_scenario::ctx(test));

        test_scenario::next_tx(test,CREATOR);
        buy_ticket(
            &mut new_coin,
            &mut creator,
            b"GOLD_TICKET", 
            &mut categories,
            &mut total_ticket, 
            &mut sold_ticket,
            test_scenario::ctx(test)
        );

        test_scenario::next_tx(test,CREATOR);
        let nft = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        resale(
            nft,
            1400,
            test_scenario::ctx(test)
        );
        
        test_scenario::next_tx(test,CREATOR);
        let initiated_resale = test_scenario::take_shared<InitiateResale>(test);

        test_scenario::next_tx(test,BUYER);
        buy_resale_ticket(&mut new_coin, initiated_resale, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER);
        let nft1 = test_scenario::take_from_sender<TicketNFT>(test);

        return_shared(
            creator,
            categories,
            total_ticket,
            sold_ticket
        );

        test_scenario::return_to_sender<TicketNFT>(test,nft1);
        new_coin.burn_for_testing();
        test_scenario::end(scenario);
    }

    fun initialize(scenario: &mut Scenario, admin: address) {
        test_scenario::next_tx(scenario, admin);
        {
            test_init(test_scenario::ctx(scenario));
        };
    } 

    #[allow(unused_let_mut)]
    fun get_shared(test: &mut Scenario) : (Creator, Category, TotalTicket, SoldTicket) {
        test_scenario::next_tx(test,CREATOR);
        let mut creator = test_scenario::take_shared<Creator>(test);

        test_scenario::next_tx(test,CREATOR);
        let mut total_ticket = test_scenario::take_shared<TotalTicket >(test);
        
        test_scenario::next_tx(test,CREATOR);
        let mut sold_ticket = test_scenario::take_shared<SoldTicket>(test);
        
        test_scenario::next_tx(test,CREATOR);
        let mut categories = test_scenario::take_shared<Category>(test);

        (creator,categories,total_ticket,sold_ticket)
    }

    fun return_shared(
        creator: Creator,
        categories: Category,
        total_ticket: TotalTicket,
        sold_ticket: SoldTicket
    ) {
        test_scenario::return_shared<Creator>(creator);
        test_scenario::return_shared<Category>(categories);
        test_scenario::return_shared<TotalTicket>(total_ticket);
        test_scenario::return_shared<SoldTicket>(sold_ticket);
    }
}